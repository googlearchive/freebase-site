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


import dir, sys, subprocess, shutil, os, hashlib, urllib, urllib2, tempfile, re, pwd, pdb, time
from optparse import OptionParser
from tempfile import mkdtemp, mkstemp
from cssmin import cssmin

try:
    import json
except ImportError:
    import simplejson as json

from freebase.api import HTTPMetawebSession, MetawebError
from freebase.api.mqlkey import quotekey, unquotekey




## GLOBAL CONFIGURATION ##

SERVICES = {


  'otg' : { 'acre' : 'http://acre.freebase.com',
            'api' : 'http://api.freebase.com',
            'freebaseapps' : 'dev.freebaseapps.com'
            },
  'sandbox' : { 'acre' : 'http://acre.sandbox-freebase.com',
                'api' : 'http://api.sandbox-freebase.com',
                'freebaseapps' : 'dev.sandbox-freebaseapps.com'
                },
  'qa' : { 'acre' : 'http://acre.branch.qa.metaweb.com',
           'api' : 'http://branch.qa.metaweb.com',
           'freebaseapps' : 'dev.branch.qa-freebaseapps.com'
           },
  'local' : { 'acre' : 'http://ae.sandbox-freebase.com:8115',
              'api' : 'http://api.sandbox-freebase.com',
              'freebaseapps' : 'dev.acre.z.:8115'
              }
}

OUTBOUND = ["outbound01.ops.sjc1.metaweb.com", "outbound02.ops.sjc1.metaweb.com"]

# recognized extensions for static files
IMG_EXTENSIONS = [".png", ".gif", ".jpg"]
EXTENSIONS = [".js", ".css", ".less", ".txt"] + IMG_EXTENSIONS

JAVA = os.environ.get("JAVA_EXE", "java")
COMPILER = os.path.join(dir.scripts, "compiler.jar")
JAVA_OPTS = ["-jar", COMPILER, "--warning_level", "QUIET"]

SVN_PATH_ROOT = '/home/%s/src/freebase_site' % os.getenv('USER')
SVN_URL_ROOT = 'https://svn.metaweb.com/svn/freebase_site'
STATIC_URL_ROOT =   'http://freebaselibs.com/static/freebase_site'

ROOT_NAMESPACE = '/freebase/site'


class App():

  def __init__(self, context, app_key, version=None):

    self.app_key = app_key
    self.version = version
    self.app_id = '%s/%s' % (ROOT_NAMESPACE, self.app_key)

    self.c = context

  def app_from_path(self, path):

    parts = path[2:].split('.site.freebase.dev')[0].split('.')

    #[3, 'promise']
    if len(parts) == 2:
      return App(self.c, parts[1], parts[0])
    else:
      return App(self.c, parts[0], None)

  def path_from_app(self, app):
    if app.version:
      return "//%s.%s.site.freebase.dev" % (app.version, app.app_key)
    else:
      return "//%s.site.freebase.dev" % app.app_key

  #will return a dictionary of labels -> app objects
  #e.g.  { 'template' :  App() }
  def read_config(self):

    config_file = "%s/CONFIG.json.json" % self.svn_path()

    try:
      fd = open(config_file, 'r')
    except:
      return self.c.warn('Cannot open file %s for reading' % config_file)

    try:
      file_contents = json.loads('\n'.join(fd))
    except:
      return self.c.error('Cannot JSON parse the config file %s' % config_file)

    fd.close()

    return file_contents


  def has_css(self):
    file_contents = self.read_config()
    return (file_contents and 'stylesheet' in file_contents.keys())

  def get_css_dependencies(self):

    #this will hold the css dependencies
    dependencies = {}
    #this will hold the app dependencies of this app
    #i.e. usually just core
    app_dependencies = {}
    #this will hold the dependencies of the core app
    core_dependencies = {}

    file_contents = self.read_config()

    if not file_contents:
      return self.c.error('Did not find CONFIG file for app %s -- aborting' % self.app_key)

    if 'stylesheet' not in file_contents.keys():
      return dependencies

    #get the core version
    version = None
    app_dependencies = self.get_dependencies()
    if app_dependencies and 'core' in app_dependencies:
      core_dependencies = app_dependencies['core'].get_dependencies()
      version = app_dependencies['core'].version

    #foobar.mf.css -> [ file1, file2, ....]
    for css_label, css_files in file_contents['stylesheet'].iteritems():
      for css_file in css_files:
      #css_files might be a string (e.g. 'foobar_bg.css') or a label, string array (e.g. ['jqueryui', 'jqueryui.css'])
      #there is a dependency to another app only for the second format
        if isinstance(css_file, list):
        #the label was found in the core app configuration
          if css_file[0] in core_dependencies.keys():
            dependencies[css_file[0]] = core_dependencies[css_file[0]]
        #the label was not found in core, and was not found in the direct dependencies of this app
          elif css_file[0] not in file_contents['apps'].keys():
            return self.c.error('The css declaration %s in %s refers to label %s that is not present in the apps section of the configuration file or the core configuration file' % (css_label, self.app_key, css_file[0]))

    return dependencies



  def get_dependencies(self):

    dependencies = {}
    file_contents = self.read_config()

    if not file_contents:
      return self.c.error('Did not find CONFIG file for app %s -- aborting' % self.app_key)

    if 'apps' in file_contents.keys():
      for label, path in file_contents['apps'].iteritems():
        if not ('.site.freebase.dev' in path and path.startswith('//')) :
          continue

        dependencies[label] = self.app_from_path(path)

    return dependencies

  def update_dependency(self, label, app):

    config_file = "%s/CONFIG.json.json" % self.svn_path()
    file_contents = self.read_config()
    config_file_existed = True

    if not file_contents:
      config_file_existed = False
      file_contents = { 'apps' : {} }

    try:
      fd = open(config_file, 'w')
    except:
      return self.c.error('Cannot open file %s for writing' % config_file)

    if 'apps' in file_contents.keys():
      file_contents['apps'][label] = self.path_from_app(app)
    self.c.verbose('Updating %s config: %s --> %s' % (self.app_key, label, self.path_from_app(app)))
    fd.write(json.dumps(file_contents))
    fd.close()

    #we have to add the file to SVN - but NOT commit it
    if not config_file_existed:
      svn_cmd = ['svn', 'add', config_file]
      r = self.c.run_cmd(svn_cmd)
      if r:
        self.c.log('Added the file %s to SVN' % config_file)
      else:
        return self.c.error('Failed to add file %s to SVN' % config_file)

    return True


  def branch(self, target_version=None):

    #you can't re-branch a branched app
    #if we are asked to branch an app that is already branched
    #just pass
    #if self.version and self.svn_exists():
    #  target_app.svn_update()
    #  self.c.verbose('App %s version %s already exists in SVN - not branching.' % (self.app_key, self.version))
    #  return self

    #figure out the next version if we were not given one
    if not target_version:
      target_version = self.next_svn_version()
      if not target_version:
        return self.c.error('Cannot figure out next valid version of app %s to branch to' % self.app_key)
      else:
        self.c.verbose('Next available version for app %s is %s' % (self.app_key, target_version))

    target_app = App(self.c, self.app_key, version=target_version)

    if target_app.svn_exists():
      target_app.svn_update()
      self.c.log('App %s version %s already exists in SVN - not branching' % (target_app.app_key, target_app.version))
      return target_app

    msg = 'Creating branch version {version} of app {app}'.format(version=target_app.version, app=target_app.app_key)
    self.c.log(msg, color=c.BLUE)
    cmd = ['svn', 'copy', self.svn_url(), target_app.svn_url(), '--parents', '-m', '"acredeploy: %s"' % msg]
    (r, output) = self.c.run_cmd(cmd)

    if not r:
      return False

    target_app.svn_update()
    return target_app

  def svn_exists(self):
    branch = self.svn_url()
    cmd = ['svn', 'ls', branch]
    (r, output) = self.c.run_cmd(cmd, exit=False)

    return r

  def svn_checkout(self, target=None):
    if not target:
      target = self.svn_path()

    cmd = ['svn', 'checkout', self.svn_url(), target]
    (r, output) = self.c.run_cmd(cmd, exit=False)

    return r

  def svn_update(self, target=None):

    if not target:
      target = self.svn_path()

    cmd = ['svn', 'up', self.svn_url(), target]
    (r, output) = self.c.run_cmd(cmd, exit=False)

    return r


  def svn_commit(self, path=None):
    if path == None:
      path = self.svn_path()

    self.c.log('Committing %s to SVN' % path)
    cmd = ['svn', 'commit', '-m', 'committing app %s version %s' % (self.app_key, self.version), path]
    return self.c.run_cmd(cmd, name='commit app', exit=False)


  def svn_commit_manifest(self, path=None):

    if path == None:
      path = self.svn_path()

    self.c.log('Committing manifest of %s  to SVN' % self.app_key)
    cmd = ['svn', 'commit', '-m', 'updating dependencies for branch of app %s version %s' % (self.app_key, self.version), '%s/MANIFEST.sjs' % path]
    return self.c.run_cmd(cmd, name='commit manifest', exit=False)


  def svn_commit_config(self):

    self.c.log('Committing config of %s  to SVN' % self.app_key)
    cmd = ['svn', 'commit', '-m', 'updating dependencies for branch of app %s version %s' % (self.app_key, self.version), '%s/CONFIG.json.json' % self.svn_path()]
    return self.c.run_cmd(cmd, name='commit config', exit=False)



  def get_app(self):
    '''
    get app info using  graph/appeditor/get_app service
    '''
    url = "{graph}/appeditor/get_app?{app_id}".format(graph=self.c.services['acre'], app_id=urllib.urlencode(dict(appid=self.app_id)))
    return self.c.fetch_url(url, isjson=True).get('result')

  def next_svn_version(self):
    (r, result) = self.c.run_cmd(['svn', 'ls', self.svn_url(dev=True)])

    versions = [int(v) for v in result.split('/\n') if self.c.is_int(v)]
    if len(versions):
      versions.sort()
      return int(versions[-1]) + 1

    return 1


  def next_graph_version(self):
    '''
    determine the next available version number for an app
    1. use graph/appeditor/get_app service to list current versions
    2. increment the highest version
    3. if no versions, return "1"
    '''
    try:
      app_info = self.get_app()
      versions = app_info.get('versions', [])
      versions = [v for v in versions if self.c.is_int(v['name'])]
      versions.sort(key=lambda x: int(x['name']))
      if versions:
        return int(versions[-1]['name']) + 1
    except urllib2.HTTPError, e:
      pass

    return 1

  def svn_deployed_url(self, svn_revision):
    return '{svn_url_root}/deployed/{app}/{svn_revision}'.format(svn_url_root=SVN_URL_ROOT, app=self.app_key, svn_revision=svn_revision)

  def svn_deployed_path(self, svn_revision):
    return '{svn_path_root}/deployed/{app}/{svn_revision}'.format(svn_path_root=SVN_PATH_ROOT, app=self.app_key, svn_revision=svn_revision)


  def svn_url(self, dev=False):

    if dev:
      return '{svn_url_root}/dev/{app}'.format(svn_url_root=SVN_URL_ROOT, app=self.app_key)
    elif not self.version:
      return '{svn_url_root}/trunk/{app}'.format(svn_url_root=SVN_URL_ROOT, app=self.app_key)
    else:
      return '{svn_url_root}/dev/{app}/{version}'.format(svn_url_root=SVN_URL_ROOT, app=self.app_key, version=self.version)

  def svn_path(self):

    if not self.version:
      return '{svn_path_root}/trunk/{app}'.format(svn_path_root=SVN_PATH_ROOT, app=self.app_key)
    else:
      return '{svn_path_root}/dev/{app}/{version}'.format(svn_path_root=SVN_PATH_ROOT, app=self.app_key, version=self.version)


  def static_server_url(self, deploy_rev):
    return "{static_url_root}/{app}/{rev}".format(static_url_root=STATIC_URL_ROOT, app=self.app_key, rev=deploy_rev)

  def url(self):
    return 'http://{version}.{app}.site.freebase.{freebaseapps}'.format(version=self.version, app=self.app_key, freebaseapps=self.c.services['freebaseapps'])


class Context():
  BLUE = '\033[94m'
  GREEN = '\033[92m'
  RED = '\033[91m'
  ENDC = '\033[0m'

  svn_path_root = '/home/%s/src/freebase_site' % os.getenv('USER')
  svn_url_root = 'https://svn.metaweb.com/svn/freebase_site'
  static_url_root =   'http://freebaselibs.com/static/freebase_site'


  def __init__(self, options):
    self.options = options
    self.action = ''

    self.svn_temp_dirs = {}

    if options.graph:
      self.services = SERVICES.get(options.graph)
      self.freebase = HTTPMetawebSession(self.services['api'], acre_service_url=self.services['acre'])
      self.freebase_logged_in = False

    self.current_app = None
    self.app = None

    if self.options.app:
      self.current_app = self.app = App(self,self.options.app, self.options.version)

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

  def remember_username(self, username):

     try:
         fd = open(os.path.join(os.environ['HOME'], '.acrepush_username'), "w")
         fd.write(username)
         fd.close()
     except:
         #silently fail here - this is just a convenience function
         return False


  def retrieve_username(self):

     username = ''

     try:
         fd = open(os.path.join(os.environ['HOME'], '.acrepush_username'), "r")
         username = fd.readline()
         fd.close()
     except:
         #silently fail here - this is just a convenience function
         pass

     return username


  def freebase_login(self):

      if self.freebase_logged_in:
          return True

      try:
          if not self.options.user:
            username = self.retrieve_username()
            user = raw_input("Username (%s): " % username)

            if not user and username:
              user = username
            elif user:
              self.remember_username(user)
          else:
            user = self.options.user

          import getpass
          pw = getpass.getpass()
      except KeyboardInterrupt:
          print "\nAborted."
          return False

      try:
          self.freebase.login(user, pw)
      except:
          self.log('Could not log in with these credentials', 'error')
          return False

      self.freebase_logged_in = True
      return True

  def hash_for_file(self,f, block_size=2**20):
    md5 = hashlib.md5()
    while True:
        data = f.read(block_size)
        if not data:
            break
        md5.update(data)
    return md5.hexdigest()

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

  def type_for_extension(self, ext):
    ct = self.FILE_TYPES.get(ext, 'text/plain')

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


  def metadata(self, directory):

    c = self.context
    app = self.app

    mdpath = os.path.join(directory, '.metadata')
    if not os.path.exists(mdpath):
        metadata = {}
    else:
        mdf = file(mdpath)
        metadata = json.load(mdf)
        mdf.close()

    if app.app_id:
      metadata['id'] = app.app_id
      f = file(os.path.join(directory, '.metadata'), 'w+')
      json.dump(metadata, f)
      f.close()

    if 'id' not in metadata:
        raise Exception("need to supply an id if .metadata is not present")

    def handle_file(f):
        script = { 'id' : None, 'name' : None, 'acre_handler' : None, 'content_type' : None, 'contents': None, 'extension': None}
        fn, ext = f.rsplit('.', 1)
        script['id'] = metadata['id'] + '/' + quotekey(fn)
        script['extension'] = ext
        script['name'] = quotekey(fn)
        script['unquoted_filename'] = fn
        script['contents'] = file(os.path.join(directory, f))
        script['SHA256'] = hashlib.sha256(script['contents'].read()).hexdigest()
        ct, handler = self.type_for_extension(ext)
        script['acre_handler'] = handler
        script['content_type'] = ct

        return script

    metadata['files'] = {}
    metadata['ignored_files'] = []

    # Skip . .. .xxxx xxx.sh and directories

    for f in os.listdir(directory):
      basename, extension = os.path.splitext(f)

      if extension in ['.sh'] or f.startswith('.') or os.path.isdir(os.path.join(directory, f)) or \
             f[-1] == '~' or basename[len(basename)-4:] in ['.mql', '.sjs', '.mjt']:
        metadata['ignored_files'].append(f)
        continue

      d = handle_file(f)

      if metadata['files'].get(d['name']):
        print 'WARNING: file %s will override contents of %s' % (f, d['name'])

      metadata['files'][d['name']] = d

    return metadata

  def print_app_diff(self, delete_files, push_files, ignored_files):

    self.context.log("Diff between %s:%s and acre trunk:" % (self.app.app_key, self.app.version))

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

  def get_app_diff(self, graph_app, metadata):
    graph_files, local_files = graph_app['files'], metadata['files']

    #the files we need to delete either because they are not in the local directory
    #or because their content-type or handler has changed
    delete_files = {}
    #the files we need to push because they have changed since the last push
    push_files = {}

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

    self.print_app_diff(delete_files, push_files, metadata['ignored_files'])
    return (delete_files, push_files)

  def push(self, app, dry=False):

    c = self.context
    self.app = app

    c.log('Starting push of %s to app %s version %s on graph %s' % (app.svn_url(), app.app_key, app.version or 'trunk', c.options.graph), color=c.BLUE)

    #checkout the code into a temporary directory
    local_dir = mkdtemp()
    success = app.svn_checkout(target=local_dir)

    if not success:
      return c.error('Unable to perform svn checkout')

    metadata = self.metadata(local_dir)
    graph_app = None

    try:
      graph_app = c.freebase.get_app(metadata['id'])
    except MetawebError:
      return c.error('app does not exist - use "create" action to create it first')

    version_app_exists = False
    if app.version and graph_app.get('versions') and len(graph_app['versions']) and app.version in [x['name'] for x in graph_app['versions']]:
      version_app_exists = True

    delete_files, push_files = {}, metadata['files']

    if graph_app:
      (delete_files, push_files) = self.get_app_diff(graph_app, metadata)

    if dry:
      print "Not making any changes (dry run)"
      return


        ###### dry run until this point ##########
    if len(delete_files.keys()) or len(push_files.keys()) or app.version:
      success = c.freebase_login()
      if not success:
        c.log('cannot push without logging in to freebase', 'error')
        return False

    if not (len(delete_files.keys()) or len(push_files.keys())):
      c.log('no files affected')

    files_changed = set()

    for filename,val in delete_files.iteritems():
      print ".",
      sys.stdout.flush()
      c.freebase.delete_app_file(app.app_id, unquotekey(filename))
      files_changed.add(filename)

    for filename, val in push_files.iteritems():
      print ".",
      sys.stdout.flush()
      val['contents'].seek(0);
      files_changed.add(filename)
      if val['acre_handler'] == 'binary':
        c.freebase.save_binary_file(val['id'], val['contents'], val['content_type'])
      else:
        contents = val['contents'].read()
        c.freebase.save_text_file(val['id'], contents, val['acre_handler'], val['content_type'])

    if (len(push_files)):
      print "\n"

    if app.version:
      time.sleep(1)
      c.freebase.create_app_version(app.app_id, app.version, timestamp='__now__')
      c.log('updated version %s' % app.version or 'trunk')

    c.log('push succesfull, %s files affected' % len(files_changed))
    return True

  def __call__(self, app=None, patch=False):

    c = self.context
    if not app:
      app = c.app
    c.set_action("push")

    if c.options.patch:
      patch = True

    #validate options
    if not (c.options.graph and app):
      c.log('You have to supply a valid graph and app for a push', 'error')
      return False

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

    if not patch:
      create_app_list(app, app_list)

    #push the checked out code
    for app in app_list:
      c.set_current_app(app)
      result = self.push(app)
      if not result:
        return c.error('Failed to push app %s version %s to graph %s' % (app.app_key, app.version or 'trunk', c.options.graph))

    #if this was a push to a specific app version, then re-push trunk
    #so that the current version is the same as trunk in SVN
    if app.version:
      c.log('restoring trunk')
      return self.push(App(c, app.app_key))

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

  def deploy_static_files(self, source_dir, source_url, dest_dir, **kws):

    c = self.context
    app = c.app
      #must return a list of filenames (js, css, img)
    files = []
    c.log('copying static files to deploy directory')

    ## LOAD MANIFEST ##

    # load app MANIFEST.sjs by doing an HTTP request for <app_url>/MANIFEST
    url = "%s/MANIFEST" % source_url
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
            file_url = "%s/MANIFEST/%s" % (source_url, filename)
            if kws:
                file_url = "%s?%s" % (url, urllib.urlencode(kws))
            filename = os.path.join(dest_dir, filename)
            with open(filename, 'w') as dest_file:
                for line in c.fetch_url(file_url):
                    dest_file.write(line)

    ## IMAGES ##

    # for images, read the local directory since images are not bundled together
    # 2. svn list version and copy images (*.png, *.gif, etc.) to dest_dir
    img_files = [f for f in os.listdir(source_dir) if os.path.splitext(f)[1].lower() in IMG_EXTENSIONS]
    for f in img_files:
        src = os.path.join(source_dir, f)
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
    branch_url = app.svn_url()
    branch_dir = app.svn_path()

    tempdir = mkdtemp()
    app.svn_checkout(tempdir)

    # update MANIFEST static_base_url
    manifest = os.path.join(branch_dir, "MANIFEST.sjs")
    if not os.path.exists(manifest):
        c.log('No MANIFEST.sjs in app directory %s' % branch_dir)
        return False

    # 1. urlfetch static files from app url (*.mf.js/*.mf.css)
    deployed_dir = mkdtemp()
    url = app.url()
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

    (success, static_files) = self.deploy_static_files(branch_dir, url, deployed_dir, use_acre_url=1)
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
    temp = mkstemp()
    with open(temp[1], "w") as tmp:
        with open(os.path.join(manifest)) as mf:
            for line in mf.xreadlines():
                tmp.write(init_re.sub('.init(mf, this, %s);' % cfg, line))
    shutil.copy2(temp[1], manifest)

    app.svn_commit(path=branch_dir)

    return True

  def inject_resources_with_base_url(self):

    c = self.context
    app = self.app

    c.log('re-fetching static files with embedded deploy hash')

    url = app.url()
    branch_dir = app.svn_path()
    deployed_url = app.svn_deployed_url(self.deploy_rev)
    c.log('static path is %s' % deployed_url)

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
    (success, static_files) = self.deploy_static_files(branch_dir, url, deployed_dir)
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

  ##  STATIC ##
  def __call__(self):

    c = self.context
    c.set_action("static")
    self.app = c.app

    if not (self.app and c.app.version and c.options.graph):
      return c.error("You must specify a valid app, version and graph for static file generation")

    #first push everything
    ActionPush(self.context)(c.app)
    c.set_action("static")

    app_list = [self.app]

    def create_app_list(app, al):

      #if this app does not have any CSS rules, we are done here
      if not app.has_css():
        return

      dependencies = app.get_css_dependencies()
      if not dependencies:
        return

      for label, d_app in dependencies.iteritems():

        #we have to compare the app keys because
        #get_dependencies() will always create a new set of
        #app objects, so set de-duplication will not work
        if d_app.app_key in [x.app_key for x in al]:
          continue

        #prepend the dependency
        al.insert(0, d_app)

        if d_app.app_key != 'routing':
          create_app_list(d_app, al)

    if not c.options.patch:
      create_app_list(c.app, app_list)

    for static_app in app_list:
      self.app = static_app
      c.set_current_app(static_app)
      c.log('Starting static generation of  %s' % self.app.app_key, color=c.BLUE)
      #figure out the base url for resources and get the concatanated and minified files
      result = self.evaluate_resource_base_url()
      if not result:
        return False

      #re-push to update with the correct base url
      #at this point, we only need to push the specific app
      #not all its dependencies
      result = ActionPush(self.context)(static_app, patch=True)
      if not result:
        return False

      c.set_action("static")

      #inject resource files with new base url
      result = self.inject_resources_with_base_url()
      if not result:
        return False


    c.log('***** NOTE: You have to restart the freebaselibs.com static servers for your resources to be available *****')
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
    library_apps = App(c, 'core').get_dependencies()

    for label, d_app in library_apps.iteritems():
      if c.options.app == d_app.app_key:
        return c.error('You cannot branch a library app on its own')

    #first branch the app that was specified in the command line
    #if a version was specified and it exists already, this is a no-op (svn up)
    from_app = App(c, c.options.app, c.options.version)
    branch_app = from_app.branch(c.options.version)

    #set the app object that is going to be used for here onwards
    #by any other stage
    c.set_app(branch_app)

    core_app = None

    updated_apps = set()
    app_bundle = set()
    app_bundle.add(branch_app)

    #if this is not the core app, and it depends on core
    #then branch the core app and update the version number in our app
    if branch_app.app_key != 'core':
      dependencies = branch_app.get_dependencies()
      if not dependencies:
        return False
      #if we depend on core but not specify a version
      if 'core' in dependencies.keys() and not dependencies['core'].version:
        core_app = dependencies['core'].branch()
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
        app.svn_commit_config()

      c.log('The following branches have been created or updated: ')
      for app in app_bundle:
        c.log('\t%s\t\t%s' % (app.app_key, app.version))

    return True

class ActionCreate():

    def __init__(self, context):
        self.context = context


    def __call__(self):
        c = self.context
        c.set_action("create")
        if not (c.options.app and c.options.graph):
            return c.error('You must specify the app key (e.g. "schema") and a graph to create a new app')

        app = App(c, c.options.app)

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
    c.set_action("static")

    if not (c.options.app and c.options.graph):
      return c.error('You must specify the app key (e.g. "schema") and a graph to deploy to')


    c.log('Starting deploy of %s -- stage: branch' % c.app.app_key, color=c.BLUE)

    success = ActionBranch(c)()

    if not success:
      return False

    c.log('Action branch finished successfully', c.GREEN)
    c.set_action("static")
    c.log('Starting deploy of %s -- stage: static/push' % c.app.app_key, color=c.BLUE)

    success = ActionStatic(c)()
    if not success:
      return False

    c.log('Action static/push finished successfully', c.GREEN)

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
        ('create', 'creates an app', ActionCreate),
        ('release', 'release a specific version of an app', ActionRelease),
        ('deploy', 'combine branch, static and push in one go', ActionDeploy)
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
    parser.add_option('-a', '--app', dest='app', default='no_app_id',
                      help='an app id - e.g. /user/namesbc/mysuperapp or homepage - separate multiple ids with commas')
    parser.add_option('-t', '--patch', dest='patch', action='store_true', 
                      default=False, help='patch only applies to the push action, and will only push the app specified without resolving its dependency tree')

    (options, args) = parser.parse_args()

    if not len(args) or args[0] not in [a[0] for a in valid_actions]:
        parser.error('You did not provide a valid action')
        exit(-1)

    #all options and args are good, let's do some clean-up / arg expansion

    context = Context(options)

    for action in args:
        for valid_action in valid_actions:
            if action == valid_action[0]:

                result = valid_action[2](context)()

                if not result:
                  context.error('FAILED: action %s failed' % action)
                else:
                  context.log('SUCCESS: action %s ended succesfully' % action, color=context.GREEN)


if __name__ == '__main__':
    main()
