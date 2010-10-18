#!/usr/bin/python
"""Handles all app deployment and admin for acre apps

Usage: acredeploy.py <command> [<arguments>]

Copyright [2010] [Google Inc.]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

__author__ = 'masouras@google.com (Michael Masouras)'


import sys, subprocess, shutil, os, hashlib, urllib, urllib2, tempfile, re, pwd, pdb, time, smtplib, socket, getpass
from email.mime.text import MIMEText
from optparse import OptionParser
from tempfile import mkdtemp, mkstemp
from cssmin import cssmin

try:
    import json
except ImportError:
    import simplejson as json

from freebase.api import HTTPMetawebSession, MetawebError
from freebase.api.mqlkey import quotekey, unquotekey

## EMAIL SETTINGS ##

USER_EMAIL_ADDRESS = "%s@google.com" % getpass.getuser()
DESTINATION_EMAIL_ADDRESS = "freebase-site@google.com"

## GLOBAL CONFIGURATION ##

SERVICES = {


  'otg' : { 'acre' : 'http://acre.freebase.com',
            'www' : 'http://www.freebase.com',
            'freebaseapps' : 'freebaseapps.com'
            },
  'sandbox' : { 'acre' : 'http://www.sandbox-freebase.com',
                'www' : 'http://www.sandbox-freebase.com',
                'freebaseapps' : 'sandbox-freebaseapps.com'
                },
  'qa' : { 'acre' : 'http://acre.branch.qa.metaweb.com',
           'www' : 'http://branch.qa.metaweb.com',
           'freebaseapps' : 'branch.qa-freebaseapps.com'
           },
  'local' : { 'acre' : 'http://ae.sandbox-freebase.com:8115',
              'www' : 'http://www.sandbox-freebase.com',
              'freebaseapps' : 'acre.z.:8115'
              }
}

OUTBOUND = ["outbound01.ops.sjc1.metaweb.com", "outbound02.ops.sjc1.metaweb.com"]

# recognized extensions for static files
IMG_EXTENSIONS = [".png", ".gif", ".jpg"]
RES_EXTENSIONS = [".js", ".css", ".less"]
EXTENSIONS = IMG_EXTENSIONS + RES_EXTENSIONS + [".txt"]

FILE_TYPES = {
    'png':'image/png',
    'jpg':'image/jpeg',
    'gif':'image/gif',
    'html':'text/html',
    'css':'text/css',
    'js':'text/javascript'
    }

JAVA = os.environ.get("JAVA_EXE", "java")
COMPILER = os.path.join(os.path.abspath(os.path.dirname(os.path.join(os.getcwd(), __file__))), "compiler.jar")
JAVA_OPTS = ["-jar", COMPILER, "--warning_level", "QUIET"]

PUBLIC_SVN_URL_ROOT = 'https://freebase-site.googlecode.com/svn/site'
PRIVATE_SVN_URL_ROOT = 'https://svn.metaweb.com/svn/freebase_site'
#PUBLIC_SVN_URL_ROOT = PRIVATE_SVN_URL_ROOT
STATIC_URL_ROOT =   'http://freebaselibs.com/static/freebase_site'

ROOT_NAMESPACE = '/freebase/site'
CONFIG_FILE = 'CONFIG.json.json'
MANIFEST_FILE = 'MANIFEST.sjs'
FIRST_LINE_REQUIRE_CONFIG = 'var mf = JSON.parse(acre.require("CONFIG.json").body);'

class AppFactory:

  #this is an app:version -> app object mapping
  #we want to return the same app object for the same app:version combination
  #in order to keep useful state (e.g. to not re-checkout the app in svn etc..)
  #i.e. app objects are sigletons
  apps = { }

  def __init__(self, context):
    self.c = context

  #create an app object out of a path
  #e.g. //4.schema.site.freebase.dev
  def from_path(self, path):
    parts = path[2:].split('.site.freebase.dev')[0].split('.')

    if len(parts) == 2:
      return self(parts[1], parts[0])
    else:
      return self(parts[0], None)

  #return an App object
  def __call__(self, app_key, version=None):
    n = "%s:%s" % (app_key, version or 'trunk')
    if self.apps.get(n):
      return self.apps[n]

    app_obj = App(self.c, app_key, version)

    self.apps[n] = app_obj
    return app_obj

class App:

  def __init__(self, context, app_key, version=None):
    self.app_key = app_key
    self.version = version

    self.app_id = '%s/%s' % (ROOT_NAMESPACE, self.app_key)

    self.c = context
    self.local_dir = None
    self.checked_out = False
    self.local_deployed_dir = None

  def __str__(self):
    return self.name()

  def name(self):
    return "%s:%s" % (self.app_key, self.version or 'trunk')


  def path(self):
    if self.version:
      return "//%s.%s.site.freebase.dev" % (self.version, self.app_key)
    else:
      return "//%s.site.freebase.dev" % self.app_key


  def type_for_extension(self, ext):
    ct = FILE_TYPES.get(ext, 'text/plain')

    if ct == 'text/plain' and ext == 'sjs':
      return (ct, 'acre_script')
    elif ct == 'text/plain' and ext == 'mql':
      return (ct, 'mqlquery')
    elif ct == 'text/plain' and ext == 'mjt':
      return (ct, 'mjt')
    elif ct == 'text/plain':
      return (ct, 'passthrough')
    elif ct.startswith('image'):
      return (ct, 'binary')
    else:
      return (ct, 'passthrough')


  def get_local_app(self, inject_config=True):

    c = self.c
    metadata = {}
    def handle_file(f):
        script = { 'id' : None, 'name' : None, 'acre_handler' : None, 'content_type' : None, 'contents': None, 'extension': None}
        fn, ext = f.rsplit('.', 1)
        script['id'] = self.app_id + '/' + quotekey(fn)
        script['extension'] = ext
        script['name'] = quotekey(fn)
        script['unquoted_filename'] = fn
        script['filehandle'] = file(os.path.join(self.svn_path(), f))
        script['contents'] = script['filehandle'].read()
        script['SHA256'] = hashlib.sha256(script['contents']).hexdigest()
        ct, handler = self.type_for_extension(ext)
        script['acre_handler'] = handler
        script['content_type'] = ct

        return script

    metadata['files'] = {}
    metadata['ignored_files'] = []

    # Skip . .. .xxxx xxx.sh and directories

    for f in os.listdir(self.svn_path()):
      basename, extension = os.path.splitext(f)

      if extension in ['.sh'] or f.startswith('.') or os.path.isdir(os.path.join(self.svn_path(), f)) or \
             f[-1] == '~' or basename[len(basename)-4:] in ['.mql', '.sjs', '.mjt']:
        metadata['ignored_files'].append(f)
        continue

      d = handle_file(f)
      metadata['files'][d['name']] = d

    manifest_filename = quotekey(MANIFEST_FILE.rsplit('.', 1)[0])
    config_filename = quotekey(CONFIG_FILE.rsplit('.', 1)[0])

    manifest_contents = metadata['files'].get(manifest_filename, {}).get('contents', None)
    config_contents = metadata['files'].get(config_filename, {}).get('contents', None)

    #if we can and should inject config file in the manifest file
    if inject_config and manifest_contents and config_contents and manifest_contents.split('\n')[0] == FIRST_LINE_REQUIRE_CONFIG:
      metadata['files'][manifest_filename]['contents'] = '\n'.join(['var mf=' + config_contents + ';'] + manifest_contents.split('\n')[1:])
      metadata['files'][manifest_filename]['SHA256'] = hashlib.sha256(metadata['files'][manifest_filename]['contents']).hexdigest()
    return metadata

  def get_app_diff(self,app):
    '''
    Creates a diff between the local files of this  app and the graph stat of the app passed as an argument.
    '''

    #the files we need to delete either because they are not in the local directory
    #or because their content-type or handler has changed
    delete_files = {}
    #the files we need to push because they have changed since the last push
    push_files = {}

    try:
      graph_app = app.get_graph_app()
    except:
      graph_app = { 'files' : {} }

    local_app = self.get_local_app()

    graph_files, local_files = graph_app.get('files', {}), local_app.get('files', {})



    #helper for comparing handlers and content type
    def different_handler_and_content_type(graph_stat, local_stat):
      for check in ['content_type', 'acre_handler']:
        if graph_stat[check] != local_stat[check]:
          return "%s updated" % check

      return False

    #first iterate through the graph files and delete any file that does not exist locally
    for filename in graph_files.keys():
      if not filename in local_files.keys():
        delete_files[filename] = { 'reason' : 'not in local directory' }

    #now iterate through the local files
    for filename, local_stat in local_files.iteritems():
        #if it's a new file, just push it
      if not graph_files.get(filename):
        local_stat['reason'] = 'new file'
        push_files[filename] = local_stat
        continue

      graph_stat = graph_files[filename]

      #if the handler or content type have changed, we need to delete the old file and re-push
      different = different_handler_and_content_type(graph_stat, local_stat)
      if different:
        delete_files[filename] = { 'reason' : different }
        local_stat['reason'] = different
        push_files[filename] = local_stat
        break

      #now check if the file contents have changed
      if graph_stat['SHA256'] != local_stat['SHA256']:
        local_stat['reason'] = 'changed content'
        push_files[filename] = local_stat

    return (delete_files, push_files)


  def has_css(self):
    (result, file_contents) = self.read_file(CONFIG_FILE, isjson=True)
    return (file_contents and 'stylesheet' in file_contents.keys())


  def last_resource_revision(self):
    '''
    Will go through the revision of all resource files and return the latest one
    '''
    revision = None

    cmd = ['svn', 'ls', '--verbose', self.svn_url()]
    (r, result) = self.c.run_cmd(cmd)


    if not r:
      return revision

    #the result is a series of lines like this:
    #  99777 kai              4178 Aug 12 16:18 loader-indicator-big.gif

    for v in result.split('\n'):
      parts = v.split(' ')

      #last part of the returned line is the filname
      filename = parts[-1]
      file_parts = filename.split('.')

      #does it have an extension
      if not len(file_parts) > 1:
        continue

      #is this a resource file
      if '.%s' % file_parts[-1] not in EXTENSIONS and file_parts[0] != 'CONFIG':
        continue

      if self.c.is_int(parts[1]) and int(parts[1]) > revision:
        revision = int(parts[1])

    return revision


  def get_resource_dependencies(self):

    #this will hold the resource dependencies
    dependencies = {}
    #this will hold the app dependencies of this app
    #i.e. usually just core
    app_dependencies = {}
    #this will hold the dependencies of the core app
    core_dependencies = {}

    (r, file_contents) = self.read_file(CONFIG_FILE, isjson=True)

    if not (r and file_contents):
      return self.c.error('Did not find CONFIG file for app %s -- aborting' % self.app_key)

    #get the core version
    version = None
    app_dependencies = self.get_dependencies()
    if app_dependencies and 'core' in app_dependencies:
      core_dependencies = app_dependencies['core'].get_dependencies()
      version = app_dependencies['core'].version


    for res in ["js", "stylesheet"]:

      dependencies[res] = {}
      if res not in file_contents.keys():
        continue
      #foobar.mf.css -> [ file1, file2, ....]
      for label, files in file_contents['stylesheet'].iteritems():
        for filename in files:
          #css_files might be a string (e.g. 'foobar_bg.css') or a label, string array (e.g. ['jqueryui', 'jqueryui.css'])
          #there is a dependency to another app only for the second format
          if isinstance(filename, list):
            #the label was found in the core app configuration
            if filename[0] in core_dependencies.keys():
              dependencies[res][filename[0]] = core_dependencies[filename[0]]
            #the label was not found in core, and was not found in the direct dependencies of this app
            elif filename[0] not in file_contents['apps'].keys():
              return self.c.error('The %s declaration %s in %s refers to label %s that is not present in the apps section of the configuration file or the core configuration file' % (res, label, self, filename[0]))

    return dependencies

  def get_dependencies(self):

    dependencies = {}

    (result, file_contents) = self.read_file(CONFIG_FILE, isjson=True)

    if not file_contents:
      return self.c.error('Did not find CONFIG file for app %s -- aborting' % self.app_key)

    if 'apps' in file_contents.keys():
      for label, path in file_contents['apps'].iteritems():
        if not ('.site.freebase.dev' in path and path.startswith('//')) :
          continue

        dependencies[label] = AppFactory(self.c).from_path(path)

    return dependencies


  def read_file(self, filename, isjson=False):

    filename = "%s/%s" % (self.svn_path(), filename)
    contents = ''

    try:
      fd = open(filename, 'r')
    except:
      self.c.warn('Cannot open file %s for reading (%s)' % (filename, self.svn_url()))
      return (False, contents)

    contents = fd.read()

    if isjson:
      try:
        contents = json.loads(contents)
      except:
        self.c.error('Cannot JSON parse the config file %s' % filename)
        return (False, contents)

    fd.close()

    return (True, contents)


  def write_file(self, filename, contents):

    file_exists, _ = self.read_file(filename)
    filename = "%s/%s" % (self.svn_path(), filename)

    try:
      fd = open(filename, 'w')
    except:
      self.c.warn('Cannot open file %s for writing' % filename)
      return False

    fd.write(contents)
    fd.close()

    if not file_exists:
      svn_cmd = ['svn', 'add', filename]
      r = self.c.run_cmd(svn_cmd)
      if r:
        self.c.log('Added the file %s to SVN' % filename)
      else:
        return self.c.error('Failed to add file %s to SVN' % filename)

    return True

  def update_dependency(self, label, app):

    (result, file_contents) = self.read_file(CONFIG_FILE, isjson=True)
    if not result:
      return False

    config_file_existed = True

    if not file_contents:
      config_file_existed = False
      file_contents = { 'apps' : {} }

    if 'apps' in file_contents.keys():
      file_contents['apps'][label] = app.path()
    self.c.verbose('Updating %s config: %s --> %s' % (self.app_key, label, app.path()))
    self.write_file(CONFIG_FILE, json.dumps(file_contents))

    return True


  def branch(self, target_version=None):

    #figure out the next version if we were not given one
    if not target_version:
      target_version = self.next_svn_version()
      if not target_version:
        return self.c.error('Cannot figure out next valid version of %s to branch to' % self.app_key)
      else:
        self.c.verbose('Next available version for app %s is %s' % (self.app_key, target_version))

    target_app = AppFactory(self.c)(self.app_key, version=target_version)

    #if this version does not exist in svn, trying to get the local disk svn path will return false
    #this is forcing a checkout, but it's ok because we are going to need to do that anyway down the road
    path = target_app.svn_path()

    if path:
      self.c.log('%s already exists in SVN - not branching' % target_app.name())
      return target_app

    msg = 'Creating branch version {version} of {app}'.format(version=target_app.version, app=target_app.app_key)
    self.c.log(msg, color=self.c.BLUE)
    cmd = ['svn', 'copy', self.svn_url(), target_app.svn_url(), '--parents', '-m', '"appdeploy: %s"' % msg, '--username', self.c.googlecode_username, '--password', self.c.googlecode_password]
    (r, output) = self.c.run_cmd(cmd)

    if not r:
      return False

    return target_app

  def svn_commit(self, path=None, msg=None):
    if path == None:
      path = self.svn_path()

    if not msg:
      msg = 'committing app %s version %s' % (self.app_key, self.version)

    self.c.log('Committing %s to SVN' % self.name())
    cmd = ['svn', 'commit', '-m', msg, path, '--username', self.c.googlecode_username, '--password', self.c.googlecode_password]
    return self.c.run_cmd(cmd, name='commit app', exit=False)


  def get_graph_app(self):
    '''
    get app info using  graph/appeditor/get_app service
    '''
    try:
      graph_app = self.c.freebase.get_app(self.path())
    except:
      if not self.version:
        self.c.log("%s does not exist yet, will create it" % self.app_key)
        try:
          ActionCreateGraph(self.c)(self)
          graph_app = self.c.freebase.get_app(self.path())
        except:
          return self.c.error('Cannot create %s - aborting.' % self.app_key)
      else:
        raise

    return graph_app

  def next_svn_version(self):
    (r, result) = self.c.run_cmd(['svn', 'ls', self.svn_url(allversions=True)])

    versions = [int(v) for v in result.split('/\n') if self.c.is_int(v)]
    if len(versions):
      versions.sort()
      return int(versions[-1]) + 1

    return 1


  def svn_deployed_url(self, svn_revision):
    return '{svn_url_root}/deployed/{app}/{svn_revision}'.format(svn_url_root=PRIVATE_SVN_URL_ROOT, app=self.app_key, svn_revision=svn_revision)

  def svn_deployed_path(self, svn_revision):

    if self.local_deployed_dir:
      return self.local_deployed_dir

    self.local_deployed_dir = mkdtemp()

    cmd = ['svn', 'checkout', self.svn_deployed_url(), self.local_deployed_dir]
    (r, output) = self.c.run_cmd(cmd, exit=False)

    if not r:
      return False

    return self.local_deployed_dir



  def svn_url(self, allversions=False):

    if allversions:
      return '{svn_url_root}/dev/{app}'.format(svn_url_root=PUBLIC_SVN_URL_ROOT, app=self.app_key)
    elif not self.version:
      return '{svn_url_root}/trunk/{app}'.format(svn_url_root=PUBLIC_SVN_URL_ROOT, app=self.app_key)
    else:
      return '{svn_url_root}/dev/{app}/{version}'.format(svn_url_root=PUBLIC_SVN_URL_ROOT, app=self.app_key, version=self.version)

  def svn_path(self):

    if self.checked_out:
      return self.local_dir

    if not self.local_dir:
      self.local_dir = mkdtemp()

    cmd = ['svn', 'checkout', self.svn_url(), self.local_dir, '--username', self.c.googlecode_username, '--password', self.c.googlecode_password]
    (r, output) = self.c.run_cmd(cmd, exit=False)

    if not r:
      return False

    self.checked_out = True
    return self.local_dir

  def static_server_url(self, deploy_rev):
    return "{static_url_root}/{app}/{rev}".format(static_url_root=STATIC_URL_ROOT, app=self.app_key, rev=deploy_rev)

  def url(self):
    return 'http://{version}.{app}.site.freebase.dev.{freebaseapps}'.format(version=self.version, app=self.app_key, freebaseapps=self.c.services['freebaseapps'])


class Context():
  BLUE = '\033[94m'
  GREEN = '\033[92m'
  RED = '\033[91m'
  ENDC = '\033[0m'


  def __init__(self, options):
    self.options = options
    self.action = ''

    self.svn_temp_dirs = {}

    if options.graph:
      self.services = SERVICES.get(options.graph)
      #after appeditor-services moved to freebase site, all requests should go to www.freebase.com
      self.freebase = HTTPMetawebSession(self.services['www'], acre_service_url=self.services['acre'])
      self.freebase_logged_in = False

    self.current_app = None
    self.app = None

    if self.options.app:
      self.current_app = self.app = AppFactory(self)(self.options.app, self.options.version)

  def set_current_app(self, app):
    self.current_app = app

  def set_app(self, app):
    self.current_app = self.app = app

  def set_action(self, action):
    self.action = action

  def warn(self, msg):
    print '[%s:%s:WARNING] %s' % (self.action, self.options.app, msg)
    return False

  def error(self, msg):
    print self.RED + '[%s:%s:ERROR] %s' % (self.action, self.options.app, msg) + self.ENDC
    return False

  def log(self, msg, subaction='', color=None):

    if subaction:
      subaction = ":%s" % subaction

    start_color, end_color = '', ''
    if color:
      start_color, end_color = color, self.ENDC

    cv = self.current_app.version
    if not cv:
      cv = 'trunk'

    print start_color + '[%s:%s %s%s] %s' % (self.action, self.current_app.app_key, cv, subaction, msg) + end_color

    return True


  def verbose(self, msg, subaction=None):
    if self.options.verbose and msg:
      return self.log(msg, subaction=None)

    return True

  def is_int(self, str):
    '''
    is str an int?
    '''
    try:
      int(str)
      return True
    except ValueError, e:
      return False

  def print_app_diff(self, delete_files, push_files, ignored_files=[]):

    for filename in ignored_files:
      print "?\t%s" % filename
    for filename,d in delete_files.iteritems():
      if filename not in push_files.keys():
        print "R\t%s\t(%s)" % (unquotekey(filename), d.get('reason', ''))

    for filename,d in push_files.iteritems():
      if filename in delete_files.keys() or d.get('reason', '') == 'changed content':
        print "M\t%s\t(%s)" % (d.get('unquoted_filename'), d.get('reason', ''))
      else:
        print "A\t%s\t(%s)" % (d.get('unquoted_filename'), d.get('reason', ''))

    sys.stdout.flush()

  def run_cmd(self, cmd, name='cmd', exit=True):

    self.log(' '.join(cmd), subaction=name)
    stdout, stderr = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE).communicate()

    if stderr:
        self.log(stderr, 'stderr')
        return (False, stderr)

    return (True, stdout)


  def fetch_url(self,url, isjson=False, tries=3):

    self.log(url, 'fetchurl')
    request = urllib2.Request(url, headers = {'Cache-control': 'no-cache' })

    while tries > 0:
        try:
            contents = urllib2.urlopen(request).readlines()
        except:
            self.log(url, subaction='fetch url error')
            if tries > 1:
              self.log('trying again....', subaction='fetch url error')
            else:
              raise

        tries -= 1

    if isjson:
        return json.loads(''.join(contents))

    return contents

  def remember_data(self, data, site, key):

     filename = os.path.join(os.environ['HOME'], '.%s_appdeploy_%s' % (site, key))

     try:
         fd = open(filename, "w")
         fd.write(data)
         fd.close()
     except:
         #silently fail here - this is just a convenience function
         return False


  def retrieve_data(self, site, key):

     data = ''
     filename = os.path.join(os.environ['HOME'], '.%s_appdeploy_%s' % (site, key))

     try:
         fd = open(filename, "r")
         data = fd.readline()
         fd.close()
     except:
         #silently fail here - this is just a convenience function
         pass

     return data


  def freebase_login(self):

    if self.freebase_logged_in:
      return True

    try:
      if not self.options.user:
        username = self.retrieve_data(site='freebase', key='username')
        user = raw_input("Freebase Username (%s): " % username)

        if not user and username:
          user = username
        elif user:
          self.remember_data(user, site='freebase', key='username')
      else:
        user = self.options.user

      pw = getpass.getpass()
    except KeyboardInterrupt:
      return self.error('Could not log in to freebase with these credentials.')

    try:
        self.freebase.login(user, pw)
    except:
        return self.error('Could not log in to freebase with these credentials.')

    self.freebase_logged_in = True
    return True


  def googlecode_login(self):

    username = None
    password = None

    try:
      #USERNAME
      stored_username = self.retrieve_data(site='googlecode', key='username')
      entered_username = raw_input("GoogleCode Username (%s): " % stored_username)

      if not entered_username and stored_username:
        username = stored_username
      elif entered_username:
        self.remember_data(entered_username, site='googlecode', key='username')
        username = entered_username
      else:
        return self.error("You must provide valid credentials for Google Code SVN.")

      #PASSWORD
      stored_password = self.retrieve_data(site='googlecode', key='password')
      if not stored_password:
        entered_password = getpass.getpass()

        if not entered_password:
          return self.error("You must provide valid credentials for Google Code SVN.")

        password = entered_password
        self.remember_data(entered_password, site='googlecode', key='password')
      else:
        password = stored_password

    except KeyboardInterrupt:
      return self.error("You must provide valid credentials for Google Code SVN.")


    self.googlecode_username = username
    self.googlecode_password = password

    return True



  def hash_for_file(self,f, block_size=2**20):
    md5 = hashlib.md5()
    while True:
        data = f.read(block_size)
        if not data:
            break
        md5.update(data)
    return md5.hexdigest()


  def send_email(self):

    s = []
    s.append('The following deployment finished succesfully: \n')
    s.append('operator:\t%s\n' % os.getlogin())
    s.append('action:\t%s\n' % self.action)
    s.append('app:\t%s\n' % self.current_app)
    s.append('graph:\t%s\n' % (self.options.graph or ''))

    msg = MIMEText(''.join(s))
    msg['Subject'] = '[appdeploy] success: %s of %s to %s' % (self.action, self.current_app, self.options.graph or '')
    msg['To'] = DESTINATION_EMAIL_ADDRESS
    msg['From'] = USER_EMAIL_ADDRESS

    try:
      #set the socket timeout to 5 seconds in case there is no smtp server responding
      #socket.setdefaulttimeout(5)
      server = smtplib.SMTP()
      server.connect('smtp')
      server.sendmail(USER_EMAIL_ADDRESS, [DESTINATION_EMAIL_ADDRESS], msg.as_string())
    except:
      self.warn('No deployment e-mail sent - error while sending email')
      return False

    return True

class ActionPush():

  FILE_TYPES = {
      'png':'image/png',
      'jpg':'image/jpeg',
      'gif':'image/gif',
      'html':'text/html',
      'css':'text/css',
      'js':'text/javascript'
      }


  def __init__(self, context, push_trunk = True):
    self.context = context
    self.app = None

  def push(self, app, dry=False):

    c = self.context
    self.app = app

    c.log('Starting push of %s to %s on %s' % (app.svn_url(), app, c.options.graph), color=c.BLUE)

    #get the diff between the local files and the graph files for this app version
    (version_delete_files, version_push_files) = app.get_app_diff(app)
    c.log('Diff between local and graph of %s' % app)
    c.print_app_diff(version_delete_files, version_push_files)

    if not (len(version_delete_files.keys()) or len(version_push_files.keys())):
      c.log('No files changed between local and graph of %s' % app)
      return True

    #if we are in a versioned app, we also need to get the diff against the graph trunk
    #in order to actually know what files we need to push
    if app.version:
      delete_files, push_files = app.get_app_diff(AppFactory(c)(app.app_key, version=None))
    #this is the trunk version of the app - so the diff is the same
    else:
      delete_files, push_files = version_delete_files, version_push_files

    if dry:
      print "Not making any changes (dry run)"
      return

        ###### dry run until this point ##########

    #log-in to freebase if we are going to do any pushes or updates
    if len(delete_files.keys()) or len(push_files.keys()) or app.version:
      success = c.freebase_login()
      if not success:
        c.log('cannot push without logging in to freebase', 'error')
        return False

    files_changed = set()

    #delete removed files
    for filename,val in delete_files.iteritems():
      print ".",
      sys.stdout.flush()
      c.verbose("Deleting file %s" % unquotekey(filename))
      c.freebase.delete_app_file(app.app_id, unquotekey(filename))
      files_changed.add(filename)

    #update changed files
    for filename, val in push_files.iteritems():
      print ".",
      sys.stdout.flush()
      files_changed.add(filename)

      uploaded = False
      tries = 3
      while tries > 0 and not uploaded:
        try:
          if val['acre_handler'] == 'binary':
            c.verbose("Uploading binary file %s" % val['name'])
            val['filehandle'].seek(0)
            c.freebase.save_binary_file(val['id'], val['filehandle'], val['content_type'])
          else:
            c.verbose("Uploading file %s" % val['name'])
            c.freebase.save_text_file(val['id'], val['contents'], val['acre_handler'], val['content_type'])
          uploaded = True

        except UnicodeDecodeError:
          c.warn('Encountered error uploading file %s, trying again...' % val['name'])
          tries -= 1

      if not uploaded:
        return c.error('Could not upload file %s - aborting push' % val['name'])

    if (len(push_files)):
      print "\n"

    if app.version:
      time.sleep(1)
      c.freebase.create_app_version(app.app_id, app.version, timestamp='__now__')
      c.log('Updated timestamp of %s' % app.name())

    c.log('push succesfull, %s files affected' % len(files_changed))
    return True

  def __call__(self, app=None, nodeps=False):

    c = self.context
    if not app:
      app = c.app
    c.set_action("push")
    c.log('Starting push of %s to %s' % (app, c.options.graph), color=c.BLUE)

    #validate options
    if not (c.options.graph and app):
      c.log('You have to supply a valid graph and app for a push', 'error')
      return False

    if c.options.nodeps:
      nodeps = c.options.nodeps

    app_list = set()
    app_list.add(app)

    def create_app_list(app, al):

      dependencies = app.get_dependencies()
      if not dependencies:
        return

      for label, d_app in dependencies.iteritems():

        #we have to compare the app keys because
        #get_dependencies() will always create a new set of
        #app objects, so set de-duplication will not work
        if d_app.app_key in [x.app_key for x in al]:
          continue

        al.add(d_app)

        if d_app.app_key != 'routing':
          create_app_list(d_app, al)

    if not nodeps:
      create_app_list(app, app_list)

    #push the checked out code
    for app in app_list:
      c.set_current_app(app)
      result = self.push(app)
      if not result:
        return c.error('Failed to push %s to %s' % (app.name(), c.options.graph))

    #if this was a push to a specific app version, then re-push trunk
    #so that the current version is the same as trunk in SVN
    if app.version:
      c.log('restoring trunk')
      return self.push(AppFactory(c)(app.app_key))

    return True

class ActionStatic():

  def __init__(self, context):
    self.context = context
    self.app = context.app

  def create_hash_for_directory(self, directory, static_files):

    c = self.context

    deploy_rev = None
    status, path = mkstemp()
    with open(path, "wb") as hash_file:
        for f in static_files:
            with open(os.path.join(directory, f), "rb") as static_file:
                c.verbose(os.path.join(directory, f), subaction='hash file')
                while True:
                    data = static_file.read(2**20)
                    if not data:
                        break
                    hash_file.write(data)
    with open(path, "rb") as hash_file:
      deploy_rev = c.hash_for_file(hash_file)

    return deploy_rev


  def deploy_static_files(self, dest_dir, use_acre_url = False):
    '''
    This function will copy resource files such as css, js and images to a deployed directory in svn.
    For CSS, and JS it will do a request for each file to the live acre app and concatanate the results into the filename specified in the manifest.
    For images, it will just copy them verbatim.
    '''
    c = self.context
    app = self.app
      #must return a list of filenames (js, css, img)
    files = []
    c.log('copying static files to deploy directory')

    ## LOAD MANIFEST ##

    # load app MANIFEST.sjs by doing an HTTP request for <app_url>/MANIFEST
    url = "%s/MANIFEST" % app.url()
    mf = c.fetch_url(url, isjson=True)
    if not (mf and mf.get('result')):
        c.log('Aborting push of resource files - no manifest found!', 'error')
        return (False, files)

    mf = mf['result']

    ## CSS and JS ##

    # go through javascript and css bundles specified in the manifest
    # by doing an http request for <app_url>/MANIFEST/<bundle_name>
    # and copy them to the target directory
    for file_type in ['javascript', 'stylesheet']:
        for filename in mf[file_type]:
            file_url = "%s/MANIFEST/%s" % (app.url(), filename)
            if use_acre_url:
                file_url = "%s?%s" % (url, urllib.urlencode({"use_acre_url" : 1}))
            filename = os.path.join(dest_dir, filename)
            with open(filename, 'w') as dest_file:
                for line in c.fetch_url(file_url):
                    dest_file.write(line)

    ## IMAGES ##

    # for images, read the local directory since images are not bundled together
    # 2. svn list version and copy images (*.png, *.gif, etc.) to dest_dir
    img_files = [f for f in os.listdir(app.svn_path()) if os.path.splitext(f)[1].lower() in IMG_EXTENSIONS]
    for f in img_files:
        src = os.path.join(app.svn_path(), f)
        # in local acre dev, we use double extensions for static files including image files
        # convert double extensions to single extension
        dest = os.path.join(dest_dir, os.path.splitext(f)[0])
        shutil.copy2(src, dest)


    # read the destination directory and return the list of filenames
    # 3. if static files, import to svn deployed dir
    files = sorted([f for f in os.listdir(dest_dir) if os.path.splitext(f)[1].lower() in EXTENSIONS])
    return (True, files)


  def evaluate_resource_base_url(self):

    c = self.context
    app = self.app
    # determine if we need to create a new deploy revision by
    # 1. determine the md5 hash of all the img files + javascript/stylesheet manifests sorted and concatenated together.
    deployed_dir = mkdtemp()

    # read MANIFEST file
    (result, manifest) = app.read_file(MANIFEST_FILE)
    if not result:
      c.log('No %s in app directory %s' % (MANIFEST_FILE, app.svn_path()))
      return False

    # 1. urlfetch static files from app url (*.mf.js/*.mf.css)
    # We need to pass use_acre_url=1, for the MANIFEST css_preprocessor to return consistent urls for css url declarations to
    # calculate deterministic hashes of all static files for an app.
    # 1. url(local.png) = http://2.localapp.site.freebase.dev.../local.png
    #                  != http://freebaselibs.com/static/freebase_site/localapp/abcdef.../local.png
    # 2. url(externalapp, external.png) = http://3.externalapp.site.freebase.dev.../external.png
    #                                  != http://freebaselibs.com/static/freebase_site/externalapp/abcdef.../external.png
    # This is needed since we have not yet set the MANIFEST static_base_url/image_base_url.
    # The static_base_url/image_base_url is determined by the md5 hash of all static files of an app
    # including the dynamically generated javascript/stylesheet MANIFEST files declared in mf.javascript and mf.stylesheet.
    # The mf.javascript files are deterministic since we go through the external apps MANIFEST/ entry point (i.e., .../MANIFEST/foo.mf.js).
    # The mf.stylesheet files also go through the external apps MANIFEST/ entry point (i.e., .../MANIFEST.foo.mf.css) but is
    # only deterministic if we DO NOT preprocess the css url(...) declarations since it uses the image_base_url.

    (success, static_files) = self.deploy_static_files(deployed_dir, use_acre_url=True)
    if not success:
        c.log('Could not get a list of files from the MANIFEST - unable to do HTTP request, or your app does not have a manifest.', 'fatal error')
        return False

    # deploy_rev is the md5 hash of all the static files sorted and concatenated together
    c.log('creating hash for static files')
    self.deploy_rev = self.create_hash_for_directory(deployed_dir, static_files)

    # update MANIFEST static_base_url
    c.log('updating the manifest file with the new deployment hash')
    base_url = app.static_server_url(self.deploy_rev)
    cfg = json.dumps({
        "static_base_url": base_url,
        "image_base_url": base_url
        })

    init_re = re.compile(r'\.init\s*\(\s*mf\s*\,\s*this.*$')
    tmp = []
    for line in manifest.split('\n'):
      tmp.append(init_re.sub('.init(mf, this, %s);' % cfg, line))

    app.write_file(MANIFEST_FILE, '\n'.join(tmp))
    app.svn_commit(msg='updated manifest with new static url')

    return True

  def generate_resource_bundle(self):

    c = self.context
    app = self.app

    c.log('re-fetching static files with embedded deploy hash')

    url = app.url()
    branch_dir = app.svn_path()
    deployed_url = app.svn_deployed_url(self.deploy_rev)
    c.log('static svn url is %s' % deployed_url)

    # check if a deployed_rev already exists or not
    cmd = ['svn', 'ls', deployed_url]
    (success, message) = c.run_cmd(cmd, exit=False)

    if success:
        c.log('Deployed directory already exists %s' % deployed_url)
        return True

    # deployed_rev does not exist, add it to svn
    deployed_dir = mkdtemp()
    # now that we have deterministically calculated the deployed_rev and updated the MANIFEST static_base_url/image_base_url,
    # we now want to reget the static_files with the correct css url(...) pointing the http://freebaselibs...
    (success, static_files) = self.deploy_static_files(deployed_dir)
    if not success:
        c.log('Could not get manifest for your app', 'fatal error')
        return False


    c.log('injecting static server url into CSS files and minifying CSS')
    # css min
    css_files = [f for f in os.listdir(deployed_dir) if os.path.splitext(f)[1].lower() == ".css"]
    for css_file in css_files:
        c.verbose(css_file, 'css file')
        css_path = os.path.join(deployed_dir, css_file)

        # we should not have any css url declrations that look like 'url(http://3.template.site.freebase.dev...)'
        cmd = ['grep', '-E', 'url\s*\(\s*https?\:\/\/[0-9]+\.', css_path]
        (r, response) = c.run_cmd(cmd)
        if not r:
            prompt = '{f} contains 1 or more acre url declarations. Continue with deploying {rev} of {app} [y/n]?'.format(f=f, rev=self.deploy_rev, app=c.options.app)
            if raw_input(prompt).lower() != 'y':
                return False

        with open(css_path, "r") as infile:
            min_css = cssmin(infile.read())
        with open(css_path, "w") as outfile:
            outfile.write(min_css)

    c.log('compiling (closure) js files')
    # js min (closure compiler)
    js_files = [f for f in os.listdir(deployed_dir) if os.path.splitext(f)[1].lower() == ".js"]
    for js_file in js_files:
        c.verbose(js_file, 'js file')
        js_path = os.path.join(deployed_dir, js_file)
        status, temppath = mkstemp()
        with open(temppath, "w") as tempfile:
            cmd = [JAVA] + JAVA_OPTS + ["--js", js_path]
            subprocess.call(cmd, stdout=tempfile)
        shutil.copy2(temppath, js_path)

    msg = 'Create static file deployed directory version {version} for app {app}'.format(version=self.deploy_rev, app=c.options.app)
    cmd = ['svn', 'import', deployed_dir, deployed_url, '-m', '"%s"' % msg]
    c.run_cmd(cmd)

    return True

  def get_resource_dependency_apps(self):
    c = self.context
    app_list = [self.app]
    def create_app_list(app, al):

      dependencies = app.get_resource_dependencies()
      if not dependencies['stylesheet']:
        return

      for label, d_app in dependencies['stylesheet'].iteritems():
        #we have to compare the app string signatures because
        #get_dependencies() will always create a new set of
        #app objects, so set de-duplication will not work
          #if str(d_app) in [str(x) for x in al]:
           # continue
        if d_app in al:
          continue

        #prepend the dependency
        al.insert(0, d_app)

        if d_app.app_key != 'routing':
          create_app_list(d_app, al)

    create_app_list(c.app, app_list)
    return app_list


  def need_static(self, app_list):
    #go through the dependency tree and find any app that had a resource file updated
    #after the last static push
    c = self.context
    need_static = set()
    for static_app in app_list:
      (r, last_recorded_revision) = static_app.read_file('.last_resource_revision')
      if not r:
        need_static.add(static_app)
        continue

      last_recorded_revision = int(''.join(last_recorded_revision))
      last_revision = static_app.last_resource_revision()

      #if the last revision of any resource file in the app is larger
      #than the last revision when we created the static files the last time
      #then we need to regenerate them.
      #This means someone made a change to the static files
      if last_revision > last_recorded_revision:
        c.log('Change in resource files of %s detected - have to regenerate static bundle.' % static_app.app_key)
        need_static.add(static_app)
      else:
        c.log('No need to generate static files for %s - no new resource files' % static_app)

    return need_static


  ##  STATIC ##
  def __call__(self):

    c = self.context
    c.set_action("static")
    self.app = c.app

    if not (self.app and self.app.version and c.options.graph):
      return c.error("You must specify a valid app, version and graph for static file generation")

    c.set_action("static")
    c.log('Starting action static for %s' % self.app.name(), color=c.BLUE)
    c.verbose('Figuring out dependencies')
    #get dependency tree for CSS for this app
    app_list = self.get_resource_dependency_apps()

    #if --force was passed, then we need to generate static files for all dependency apps

    if c.options.force:
      need_static = app_list
    else:
      c.verbose('Figuring out which apps need static generation')
      need_static = self.need_static(app_list)

    if not len(need_static):
      #but we still need to push just this app because there were changes to other files
      return ActionPush(self.context)(self.app, nodeps=True)

    for static_app in need_static:
      self.app = static_app
      c.set_current_app(static_app)
      #figure out the base url for resources and get the concatanated and minified files
      result = self.evaluate_resource_base_url()
      if not result:
        return False

      #re-push to update with the correct base url
      #at this point, we only need to push the specific app
      #not all its dependencies
      result = ActionPush(self.context)(static_app, nodeps=True)
      if not result:
        return False

      c.set_action("static")

      #inject resource files with new base url
      result = self.generate_resource_bundle()
      if not result:
        return False

      self.app.write_file('.last_resource_revision', str(self.app.last_resource_revision()))
      self.app.svn_commit(msg='commit last resource revision file')

    c.log('***** NOTE: You have to restart the freebaselibs.com static servers for your resources to be available *****', c.BLUE)
    return True

class ActionBranch():

  def __init__(self, context):
    self.context = context


  def __call__(self):
    c = self.context
    c.set_action("branch")

    if not c.options.app:
      return c.error('You have to specify a valid app to branch')

    c.log('Starting branching app %s' % c.app.app_key, color=c.BLUE)

    #first make sure we are not asked to branch a library app
    #you should only be able to branch a page app, or core (all libraries together)
    library_apps = AppFactory(c)('core').get_dependencies()

    for label, d_app in library_apps.iteritems():
      if c.options.app == d_app.app_key:
        return c.error('You cannot branch a library app on its own')

    #first branch the app that was specified in the command line
    #if a version was specified and it exists already, this is a no-op (svn up)
    from_app = AppFactory(c)(c.options.app, c.options.version)
    branch_app = from_app.branch(c.options.version)

    #set the app object that is going to be used for here onwards
    #by any other stage
    c.set_app(branch_app)

    core_app = None

    updated_apps = set()
    app_bundle = set([branch_app])

    #if this is not the core app, and it depends on core
    #then branch the core app and update the version number in our app
    if branch_app.app_key != 'core':
      dependencies = branch_app.get_dependencies()
      if dependencies:
        #if we depend on core but not specify a version
        if 'core' in dependencies.keys() and (not dependencies['core'].version or c.options.core):
          #c.options.core will be a version if specified in the command line or None
          core_app = dependencies['core'].branch(c.options.core)
          branch_app.update_dependency('core', core_app)
          updated_apps.add(branch_app)
        #if we depend on a specific version of core, we are done
        elif 'core' in dependencies.keys():
          core_app = dependencies['core']
    #this is the core app
    else:
      core_app = branch_app

    #if there was a dependency on core, or this was the core app
    if core_app:

      app_bundle.add(core_app)
      #for each of the dependent apps of core (i.e. all the library apps)
      for label, d_app in core_app.get_dependencies().iteritems():

        #branch the library app and update the core CONFIG file
        branch_app = d_app.branch(core_app.version)

        app_bundle.add(branch_app)

        #update the core config file with the new dependency version
        #only if it used to point to trunk and is now a new version
        if branch_app and d_app.version != branch_app.version:
          #point core to this specific library app version
          core_app.update_dependency(label, branch_app)
          updated_apps.add(core_app)

        if branch_app.app_key  != 'routing':

          branch_app_dependencies = branch_app.get_dependencies()

          if not branch_app_dependencies:
            return False

          if not (branch_app_dependencies.get('core') and branch_app_dependencies['core'].version == core_app.version):
            branch_app.update_dependency('core', core_app)
            updated_apps.add(branch_app)

      for app in updated_apps:
        app.svn_commit(msg='updated dependencies for %s' % app.name())

      c.log('The following branches are going to be used: ')
      for app in app_bundle:
        c.log('\t%s\t\t%s' % (app.app_key, app.version))

    return True

class ActionCreateGraph():

    def __init__(self, context):
        self.context = context


    def __call__(self, app=None):
        c = self.context
        c.set_action("create")
        if not ((c.options.app or app) and c.options.graph):
            return c.error('You must specify the app key (e.g. "schema") and a graph to create a new app')

        if not app:
          app = AppFactory(c)(c.options.app)

        c.log('create app %s in graph %s' % (app.app_key, c.options.graph))

        if bool(c.freebase.mqlread({"id": app.app_id})):
          c.log('app %s already exists' % app.app_id)
        else:
          success = c.freebase_login()
          if not success:
            return c.error('failed to get freebase credentials - aborting app creation')

          name = "freebase.com %s" % app.app_key
          c.freebase.create_app(app.app_id, name=name, extra_group="/m/043wdvg" )

        return True

class ActionDeploy:

  def __init__(self, context):
    self.context = context

  def __call__(self):

    c = self.context
    c.set_action("deploy")

    if not (c.options.app and c.options.graph):
      return c.error('You must specify the app key (e.g. "schema") and a graph to deploy to')

    ###    BRANCH    ###

    c.set_action("branch")
    c.log('Starting deploy of %s -- stage: branch' % c.app, color=c.BLUE)
    success = ActionBranch(c)()
    if not success:
      return False
    c.log('Action branch finished successfully', c.GREEN)

    ###   INITIAL PUSH   ###

    c.set_action("push")
    c.log('Continuing with deploy of %s -- stage: initial push' % c.app, color=c.BLUE)
    success = ActionPush(c)(c.app)
    if not success:
      return False
    c.log('Action initial push finished successfully', c.GREEN)

    ###   STATIC PUSH   ###

    c.set_action("static")
    c.log('Continuing with deploy of %s -- stage: static push' % c.app, color=c.BLUE)
    success = ActionStatic(c)()
    if not success:
      return False
    c.log('Action static/push finished successfully', c.GREEN)

    return True

class ActionCreateLocal:
  '''Create a local app out of an existing app'''

  def __init__(self, context):
    self.context = context

  def __call__(self):

    c = self.context

    if not (c.options.app and c.options.basedon):
      return c.error('You must specify a valid app name and an app to base your new app on.')

    basedon_app = AppFactory(c)(c.options.basedon)

    cmd = ['svn', 'cp', basedon_app.svn_url(), c.current_app.svn_url(), '-m', 'creating %s out of %s' % (c.current_app, basedon_app)]
    (r, result) = c.run_cmd(cmd)

    return r



class ActionTest:
  '''dummy action used for experimenting'''

  def __init__(self, context):
    self.context = context

  def __call__(self):

    c = self.context
    return True

class ActionRelease:

  def __init__(self, context):
    self.context = context

  def __call__(self):

    c = self.context

    c.set_action("release")
    if not (c.options.app and c.options.graph and c.options.version):
      return c.error('You must specify the app key (e.g. "schema"), a graph and a version to release')

    c.log('Releasing app %s version %s' % (c.app.app_key, c.app.version), color=c.BLUE)

    success = c.freebase_login()
    if not success:
      return c.error('You must provide valid freebase credentials in order to release an app')

    try:
      c.freebase.set_app_release(c.app.app_id, c.app.version)
    except:
      c.error('There was an error releasing the app.')
      raise

    return True

def main():

    # OPTION PARSING

    valid_actions = [
        ('branch', 'creates a branch of your app', ActionBranch),
        ('push', 'pushes a specified directory to an app version', ActionPush),
        ('static', 'generates and deployes static bundles to the edge servers', ActionStatic),
        ('create_graph', 'creates an app on the given graph', ActionCreateGraph),
        ('create_local', 'combine branch, static and push in one go', ActionCreateLocal),
        ('release', 'release a specific version of an app', ActionRelease),
        ('deploy', 'combine branch, static and push in one go', ActionDeploy),
        ('test', 'test', ActionTest)
        ]


    usage = '''%prog action [options]
\nActions:
'''
    usage += '\n'.join(['\t%s\t%s' % a[:2] for a in valid_actions])

    parser = OptionParser(usage=usage)
    parser.add_option('-g', '--graph', dest='graph',
                      help='acre graph - i.e. otg|sandbox|qa')
    parser.add_option('-u', '--user', dest='user',
                      help='freebase username - e.g. namesbc')
    parser.add_option('-v', '--version', dest='version', default=None,
                      help='a version of the app - e.g. 12')
    parser.add_option('-b', '--verbose', dest='verbose', action='store_true',
                      default=False, help='verbose mode will print out more debugging output')
    parser.add_option('-a', '--app', dest='app', default=None,
                      help='an app id - e.g. /user/namesbc/mysuperapp or an app key under /freebase/site - e.g. homepage')
    parser.add_option('-c', '--core', dest='core', default=None,
                      help='the version of core you want to tie this app branch to')
    parser.add_option('', '--basedon', dest='basedon', default=None,
                      help='the app key you want to base a new app on - used for the action create_local')
    parser.add_option('-f', '--force', dest='force', action='store_true', default=False,
                      help='--force results depend on context: for action static, it means that all static bundles will be re-generated')
    parser.add_option('-n', '--nodeps', dest='nodeps', action='store_true', default=False,
                      help='will not resolve app dependencies for branching, pushing or static generation')
    parser.add_option('', '--noemail', dest='noemail', action='store_true', default=False,
                      help='do not send a notification email')


    (options, args) = parser.parse_args()

    if not len(args) or args[0] not in [a[0] for a in valid_actions]:
        parser.error('You did not provide a valid action')
        exit(-1)

    #all options and args are good, let's do some clean-up / arg expansion

    context = Context(options)

    success = context.googlecode_login()
    if not success:
      exit(-1)

    for action in args:
        for valid_action in valid_actions:
            if action == valid_action[0]:

              context.set_action(action)
              result = valid_action[2](context)()
              context.set_action(action)

              if not result:
                context.error('FAILED: action %s failed' % action)
              else:
                context.log('SUCCESS: action %s ended succesfully.' % action, color=context.GREEN)
                if not options.noemail:
                  context.log('Sending deployment e-mail.')
                  context.send_email()


if __name__ == '__main__':
    main()
