#!/usr/bin/python
import sys, subprocess, shutil, os, hashlib, urllib, urllib2, tempfile, re, pwd, pdb, time, smtplib, socket, getpass, stat
from email.mime.text import MIMEText
from optparse import OptionParser
from tempfile import mkdtemp, mkstemp
from cssmin import cssmin

LICENSE_PREAMBLE = '''
/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * Additional Licenses for Third Party components can be found here:
 * http://wiki.freebase.com/wiki/Freebase_Site_License
 *
 */
'''

try:
    import json
except ImportError:
    import simplejson as json

try:
    from freebase.api import HTTPMetawebSession, MetawebError
except ImportError:
    print "ERROR: You have to install freebase-python for this to work. http://code.google.com/p/freebase-python/source/checkout"
    exit(-1)

from freebase.api.mqlkey import quotekey, unquotekey

## EMAIL SETTINGS ##

USER_EMAIL_ADDRESS = "%s@google.com" % getpass.getuser()
DESTINATION_EMAIL_ADDRESS = "freebase-site@google.com"

## GLOBAL CONFIGURATION ##

SERVICES = {


  'otg' : { 'acre' : 'http://www.freebase.com',
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
  'local' : { 'acre' : 'http://devel.sandbox-freebase.com:8115',
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

PRIVATE_SVN_URL_ROOT = 'https://svn.metaweb.com/svn/freebase_site'

ROOT_NAMESPACE = '/freebase/site'
CONFIG_FILE = 'CONFIG.json.json'
MANIFEST_FILE = 'MANIFEST.sjs'
FIRST_LINE_REQUIRE_CONFIG = 'var config = JSON.parse(acre.require("CONFIG.json").body);'

ACRE_ID_SVN_SUFFIX = ".tags.svn.freebase-site.googlecode.dev"
ACRE_ID_GRAPH_SUFFIX = ".site.freebase.dev"



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
      
    separator = ACRE_ID_GRAPH_SUFFIX
    if ACRE_ID_SVN_SUFFIX in path:  
        separator = ACRE_ID_SVN_SUFFIX

    parts = path[2:].split(separator)[0].split('.')

    if len(parts) == 2:
      return self(parts[1], parts[0])
    else:
      return self(parts[0], None)

  #return an App object
  def __call__(self, app_key, version=None, tag=None):
    n = "%s:%s:%s" % (app_key, version or 'trunk', tag or 'none')
    if self.apps.get(n):
      return self.apps[n]

    app_obj = App(self.c, app_key, version, tag)

    self.apps[n] = app_obj
    return app_obj

class App:

  def __init__(self, context, app_key, version=None, tag=None):
    self.app_key = app_key
    self.version = version
    self.tag = tag

    self.app_id = '%s/%s' % (ROOT_NAMESPACE, self.app_key)

    self.c = context
    self.checked_out = False
    self.local_dir = None
    self.local_deployed_dir = None
    self.environment = None

    self.needs_static_generation = False
    self.pending_static_hash = None
    self.done_static_generation = False

  def __str__(self):
    return "%s:%s:%s" % (self.app_key, self.version or 'trunk', self.tag or 'none')

  def path(self):

    if self.tag:
      #return "//%s.%s.site.freebase.dev" % (self.tag, self.app_key)
      return "//%s.%s%s" % (self.tag, self.app_key, ACRE_ID_SVN_SUFFIX)
    elif self.version:
      return "//%s.%s%s" % (self.version, self.app_key, ACRE_ID_GRAPH_SUFFIX)
    else:
      return "//%s%s" % (self.app_key, ACRE_ID_GRAPH_SUFFIX)

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
      metadata['files'][manifest_filename]['contents'] = '\n'.join(['var config=' + config_contents + ';'] + manifest_contents.split('\n')[1:])
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


  def last_resource_revision(self):
    '''
    Will go through the revision of all resource files and return the latest one
    '''
    revision = 0
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

      if self.c.is_int(parts[3]) and int(parts[3]) > revision:
        revision = int(parts[3])

    return revision


  def write_static_files(self, dest_dir):
    '''
    This function will copy resource files such as css, js and images to a deployed directory in svn.
    For CSS, and JS it will do a request for each file to the live acre app and concatanate the results into the filename specified in the manifest.
    For images, it will just copy them verbatim.
    '''
    c = self.context

      #must return a list of filenames (js, css, img)
    files = []
    c.log('copying static files to deploy directory')

    ## LOAD MANIFEST ##

    # load app MANIFEST.sjs by doing an HTTP request for <app_url>/MANIFEST
    url = "%s/MANIFEST" % self.url()
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
        for filename in mf.get(file_type, []):
            file_url = "%s/MANIFEST/%s?use_pending_static_hash=1" % (self.static_url(), filename)
            filename = os.path.join(dest_dir, filename)
            with open(filename, 'w') as dest_file:
                for line in c.fetch_url(file_url):
                    dest_file.write(line)

    ## IMAGES ##

    # for images, read the local directory since images are not bundled together
    # 2. svn list version and copy images (*.png, *.gif, etc.) to dest_dir
    img_files = [f for f in os.listdir(self.svn_path()) if os.path.splitext(f)[1].lower() in IMG_EXTENSIONS]
    for f in img_files:
        src = os.path.join(self.svn_path(), f)
        # in local acre dev, we use double extensions for static files including image files
        # convert double extensions to single extension
        dest = os.path.join(dest_dir, os.path.splitext(f)[0])
        shutil.copy2(src, dest)


    # read the destination directory and return the list of filenames
    # 3. if static files, import to svn deployed dir
    files = sorted([f for f in os.listdir(dest_dir) if os.path.splitext(f)[1].lower() in EXTENSIONS])
    return (True, files)



  def generate_static_bundle(self):

    c = self.c

    url = self.url()
    branch_dir = self.svn_path()
    deployed_dir = mkdtemp()

    # we now want to reget the static_files with the correct css url(...) pointing the http://freebaselibs...
    (success, static_files) = self.write_static_files(deployed_dir)
    if not success:
        c.log('Could not get manifest for your app', 'fatal error')
        return False

    # css min
    css_files = [f for f in os.listdir(deployed_dir) if os.path.splitext(f)[1].lower() == ".css"]
    for css_file in css_files:
      c.verbose(css_file, 'css file')
      css_path = os.path.join(deployed_dir, css_file)

      # we should not have any css url declrations that look like 'url(http://3.template.site.freebase.dev...)'
      cmd = ['grep', '-E', 'url\s*\(\s*https?\:\/\/[0-9]+\.', css_path]
      (r, response) = c.run_cmd(cmd)
      if not r:
        prompt = '{f} contains 1 or more acre url declarations. Continue with deploying {app} [y/n]?'.format(f=f, app=str(self))
        if raw_input(prompt).lower() != 'y':
          return False

      with open(css_path, "r") as infile:
        min_css = cssmin(infile.read())
      with open(css_path, "w") as outfile:
        outfile.write(LICENSE_PREAMBLE)
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

      with open(temppath, "r") as infile:
        bundled_js = infile.read()
      with open(js_path, "w") as outfile:
        outfile.write(LICENSE_PREAMBLE)
        outfile.write(bundled_js)

    self.deployed_dir = deployed_dir

    return True

  def commit_static_bundle(self):

    msg = 'Create static file deployed directory version {version} for app {app}'.format(version=self.deploy_rev, app=str(self))
    cmd = ['svn', 'import', self.deployed_dir, self.svn_static_url(), '-m', '"%s"' % msg]
    (r, result) = self.c.run_cmd(cmd)
    return r


  def generate_static_hash(self, last_revision=None):
    if not last_revision:
      last_revision = self.last_resource_revision

    return "%s_%s" % (self.version, last_revision)


  def statify(self):

    #we have already done this for this app in this session
    if self.done_static_generation:
      return True

    #get the static hash (<version>_<last_svn_revision>)
    if not self.pending_static_hash:
      self.pending_static_hash = self.generate_static_hash()

    #read the configuration file and update it with the new static hash as pending
    (r, config) = self.read_file(CONFIG_FILE, isjson=True, warn=False)

    if not (r and config):
      return self.c.error('%s does not have a CONFIG.json file, so static bundles cannot be created' % self)

    config['pending_static_hash'] = self.pending_static_hash
    self.write_file(CONFIG_FILE, json.dumps(config))

    self.svn_commit(msg="%s pending static hash" % self.pending_static_hash)
    self.copy_to_appengine()

    #inject resource files with new base url
    result = self.generate_static_bundle()
    if not result:
        return False

    #result = self.commit_static_bundle()
    #if not result:
    #  return False

    last_static_revision = self.app.last_resource_revision()
    if last_static_revision:
      self.write_file('.last_static_revision', str(last_static_revision))
      self.svn_commit(msg='commit last resource revision file')

    self.done_static_generation = True


  def needs_static_bundle(self):
    '''Determine if this app qualifies for static bundle generation,
    and if it doesn, whether we need to create a new one.

    This function does NOT take into account app dependencies.

    An app qualifies if:
    - it has any js/css/image files
    - it has a css/js declaration in its config file
    - it does not have a static bundle generated since the last update
    of its resource files / CONFIG

    Returns True or False
    You can call this as many times for a given app, it will remember the last calculated result.
    '''

    c = self.c

    if self.needs_static_generation:
      return True

    local_app = self.get_local_app(inject_config = False)

    needs = False

    for app_file in local_app['files'].values():
      if '.%s' % app_file['extension'] in EXTENSIONS:
        needs = True
        break

    if not needs:
      dependencies = self.get_resource_dependencies()
      if dependencies:
        for res in ['js', 'stylesheet']:
          if len(dependencies.get(res, {}).keys()):
            needs = True
            break

    if not needs:
      return False

    (r, last_recorded_revision) = self.read_file('.last_static_revision', warn=False)

    #if there was a stamp
    if r:
      try:
        last_recorded_revision = int(last_recorded_revision)
      except:
        last_recorded_revision = 0

    last_revision = self.last_resource_revision()

    #if the last revision of any resource file in the app is larger
    #than the last revision when we created the static files the last time
    #then we need to regenerate them.
    #This means someone made a change to the static files
    if not r or last_revision > last_recorded_revision:
      self.needs_static_generation = True
      self.pending_static_hash = self.generate_static_hash(last_revision)
      c.log('Change in resource files of %s detected - have to generate static bundle, new hash is %s' % (self, self.pending_static_hash))
      return True

    c.log('No need to generate static files for %s - no new resource files' % self)
    return False


  def get_code_dependencies_list(self):
    '''Return a list of apps that this app has code dependencies on.
    '''

    apps = set()
    apps.add(self)

    def create_app_list(app, al):

      dependencies = app.get_dependencies()
      if not dependencies:
        return

      for label, d_app in dependencies.iteritems():
        if d_app in al:
          continue

        al.add(d_app)
        create_app_list(d_app, al)

    create_app_list(self, apps)
    return apps

  def get_static_dependencies_list(self):
    '''Return a list of apps that this app has static dependencies on.
    '''

    #ordering is important, so we can't use sets here
    apps = []

    if not self.needs_static_bundle():
      return apps

    apps = [self]

    dependencies = self.get_resource_dependencies()
    if not dependencies.get('stylesheet', None):
      return apps

    def create_app_list(app, al):

      dependencies = app.get_resource_dependencies()
      if not dependencies['stylesheet']:
        return

      #if we 've already seen this app, or it does not need a static bundle
      #then we can ommit it from the list of apps
      for label, d_app in dependencies['stylesheet'].iteritems():
        if d_app in al or not d_app.needs_static_bundle():
          continue

        #prepend the dependency
        al.insert(0, d_app)

        if d_app.app_key != 'routing':
          create_app_list(d_app, al)

    create_app_list(self, apps)

    return apps

  def get_resource_dependencies(self):

    #this will hold the resource dependencies
    dependencies = {}
    #this will hold the app dependencies of this app
    #i.e. usually just core
    app_dependencies = {}
    #this will hold the dependencies of the core app
    core_dependencies = {}

    (r, file_contents) = self.read_file(CONFIG_FILE, isjson=True, warn=False)

    if not (r and file_contents):
      return dependencies

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

  def get_dependencies(self, config = None):

    dependencies = {}

    if not config:
        (result, config) = self.read_file(CONFIG_FILE, isjson=True)

    self.c.verbose('Could not open CONFIG file for %s' % self)

    if not config:
      return False

    if 'apps' in config.keys():
      for label, path in config['apps'].iteritems():
        if not ((ACRE_ID_GRAPH_SUFFIX in path or ACRE_ID_SVN_SUFFIX in path) and path.startswith('//')) :
          continue

        dependencies[label] = AppFactory(self.c).from_path(path)

    return dependencies


  def read_file(self, filename, isjson=False, warn=True):

    filename = "%s/%s" % (self.svn_path(), filename)
    contents = ''

    try:
      fd = open(filename, 'r')
    except:
      if warn:
        self.c.warn('Cannot open file %s for reading (%s)' % (filename, self.svn_url()))
      return (False, contents)

    contents = fd.read()

    if isjson:
      try:
        contents = json.loads(contents)
      except:
        if warn:
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

    if not file_contents:
      file_contents = { 'apps' : {} }

    if 'apps' in file_contents.keys():
      if file_contents['apps'].get(label, None) == app.path():
        return False

    file_contents['apps'][label] = app.path()
    self.c.verbose('Updating %s config: %s --> %s' % (self.app_key, label, app.path()))
    self.write_file(CONFIG_FILE, json.dumps(file_contents))

    return True


  def last_tag(self):
    '''
    Returns the last tag as a string or None if there are no tags
    e.g. '15b'
    '''

    (r, result) = self.c.run_cmd(['svn', 'ls', self.svn_url(alltags=True)])
    if not r:
        return None

    minor_tags = []

    for tag in result.split('/\n'):
        #e.g. 16a, 16b, etc...
        matches = re.match('(\d+)(\w)$', tag)
        if matches and matches.group(1) == self.version:
            minor_tags.append(matches.group(0))


    if not len(minor_tags):
        return None

    minor_tags.sort()
    return minor_tags[-1]

  def next_tag(self):
    '''
    Returns the next available tag as a string
    e.g. '15a'
    '''

    first_tag = "%sa" % self.version
    last_tag = self.last_tag()

    if not last_tag:
        return first_tag

    matches = re.match('\d+(\w)$', last_tag)
    return "%s%s" % (self.version, chr(ord(matches.group(1)) + 1))
      
  def get_tag(self, tag):
    '''
    Returns an app object if the tag exists for this app
    or False if it does not
    '''

    tagged_app = AppFactory(self.c)(self.app_key, version=self.version, tag=tag)

    #this will fail if it's not in svn
    r = tagged_app.svn_path(warn=False)
    
    if not r:
        return False

    return tagged_app

  def create_tag(self, tag=None):
    '''
    Creates a new tag directory and copies the branched app there
    Returns an instance of the new app
    '''

    if not tag:
        tag = self.next_tag()

    msg = 'Creating tag %s' % tag

    target_app = AppFactory(self.c)(self.app_key, version=self.version, tag=tag)

    cmd = ['svn', 'copy', self.svn_url(), target_app.svn_url(), '--parents', '-m', '"sitecfg: %s"' % msg, '--username', self.c.googlecode_username, '--password', self.c.googlecode_password]
    (r, output) = self.c.run_cmd(cmd)

    if not r:
        return r

    return target_app
    
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
      self.c.log('%s already exists in SVN - not branching' % target_app)
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

    self.c.log('Committing %s to SVN' % self)
    cmd = ['svn', 'commit', '-m', msg, path, '--username', self.c.googlecode_username, '--password', self.c.googlecode_password]
    return self.c.run_cmd(cmd, name='commit app', exit=False)


  def get_graph_app_from_environment(self, service):

    s = self.c.get_freebase_services(service)
    if not s:
      return self.c.error('Unable to instantiate freebase services.')

    try:
      return s.get_app(self.path())
    except:
      return self.c.error('Could not get %s from appeditor services' % self)


  def get_graph_app(self, service=None):
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

  def last_svn_version(self):
    return int(self.next_svn_version() - 1)

  def next_svn_version(self):
    (r, result) = self.c.run_cmd(['svn', 'ls', self.svn_url(allversions=True)])

    versions = [int(v) for v in result.split('/\n') if self.c.is_int(v)]
    if len(versions):
      versions.sort()
      return int(versions[-1]) + 1

    return 1


  def svn_static_url(self):

    if self.pending_static_hash:
      return '%s/static/%s/%s' (self.c.SITE_SVN_URL, self.app_key, self.pending_static_hash)

    return self.c.error('Cannot compute static SVN path because there is no pending static hash')

  def svn_deployed_url(self, deployed_hash):
    return '{svn_url_root}/deployed/{app}/{deployed_hash}'.format(svn_url_root=PRIVATE_SVN_URL_ROOT, app=self.app_key, deployed_hash=deployed_hash)

  def svn_url(self, allversions=False, alltags=False):

    if allversions:
        return '{svn_url_root}/branches/site/{app}'.format(svn_url_root=self.c.SITE_SVN_URL, app=self.app_key)
    elif alltags:
        return '{svn_url_root}/tags/site/{app}'.format(svn_url_root=self.c.SITE_SVN_URL, app=self.app_key)
    elif not self.version:
        return '{svn_url_root}/trunk/site/{app}'.format(svn_url_root=self.c.SITE_SVN_URL, app=self.app_key)
    elif not self.tag:
        return '{svn_url_root}/branches/site/{app}/{version}'.format(svn_url_root=self.c.SITE_SVN_URL, app=self.app_key, version=self.version)
    else:
        return '{svn_url_root}/tags/site/{app}/{tag}'.format(svn_url_root=self.c.SITE_SVN_URL, app=self.app_key, tag=self.tag)        


  #will copy the app from its checked out directory to the target directory
  #and then get rid of the .svn directory
  #it will REMOVE the target directory before copying the app over first
  def copy(self, target_dir):
    if os.path.isdir(target_dir):
      try:
        shutil.rmtree(target_dir)
      except:
        return self.c.error('Cannot copy app to existing directory %s (cannot delete directory first)' % self)

    shutil.copytree(self.svn_path(), target_dir)
    shutil.rmtree(target_dir + '/.svn')
    return True

  def copy_to_appengine_dir(self):
    app_dir = self.c.acre.site_dir() + '/' + self.app_key
    self.copy(app_dir)

    if self.version:
      self.copy(app_dir + '/' + self.version)
      self.copy(app_dir + '/release')

  def copy_static(self, target_dir):
    pass

  #checks out the app from SVN into the specified directory
  def svn_checkout(self, target_dir, warn=True):

    cmd = ['svn', 'checkout', self.svn_url(), target_dir, '--username', self.c.googlecode_username, '--password', self.c.googlecode_password]
    (r, output) = self.c.run_cmd(cmd, exit=False, warn=warn)

    if not r:
      if warn:
          return self.c.error(output)
      else:
          return False

    return True

  #creates a directory and checks out the path
  #returns the directory where the app is checked out
  #the local path is remembered for future use
  def svn_path(self, warn=True):

    if self.checked_out:
      return self.local_dir

    if not self.local_dir:
      self.local_dir = mkdtemp()

    r = self.svn_checkout(self.local_dir, warn=warn)

    if not r:
      return False

    self.checked_out = True
    return self.local_dir

  def static_url(self):
    return self.url(host = self.c.acre.url())

  def url(self, services = None, host = None):

    if not services:
      services = self.c.services

    if not host:
      host = services['freebaseapps']

    if self.version:
      return 'http://{version}.{app}.site.freebase.dev.{freebaseapps}'.format(version=self.version, app=self.app_key, freebaseapps=host)
    else:
      return 'http://{app}.site.freebase.dev.{freebaseapps}'.format(app=self.app_key, freebaseapps=host)

class Context():
  BLUE = '\033[94m'
  GREEN = '\033[92m'
  RED = '\033[91m'
  ENDC = '\033[0m'

  ACRE_SVN_URL = 'https://acre.googlecode.com/svn'
  SITE_SVN_URL = 'https://freebase-site.googlecode.com/svn'

  def __init__(self, options):
    self.options = options
    self.action = ''

    self.reminders = []
    #each dictionary entry is a HTTPMetawebSession object to a freebase graph
    #self.freebase = {}

    if getattr(options, 'graph', False):
      self.services = SERVICES[options.graph]
      self.freebase = self.get_freebase_services(SERVICES.get(options.graph, {}))
      self.freebase_logged_in = False

    self.current_app = None
    self.app = None

    self.googlecode_username = None
    self.googlecode_password = None

    if getattr(self.options, 'app', False):
      self.current_app = self.app = AppFactory(self)(self.options.app, self.options.version)

    self.quiet = False
    self.acre = None


  def set_acre(self, acre):
    self.acre = acre

  def be_quiet(self):
    self.quiet = True

  def get_freebase_services(self,service):
    if 'www' in service.keys() and 'acre' in service.keys():
      return HTTPMetawebSession(service['www'], acre_service_url=service['acre'])

    return False

  def set_current_app(self, app):
    self.current_app = app

  def set_app(self, app):
    self.current_app = self.app = app

  def set_action(self, action):
    self.action = action

  def no_email(self):
    self.options.noemail = True

  def reminder(self, msg):
      self.reminders.append(msg)

  def warn(self, msg):
    return self.log(msg, subaction='WARNING')

  def error(self, msg):
    self.log(msg, subaction='ERROR', color=self.RED)
    return False

  def log(self, msg, subaction='', color=None):

    if self.quiet:
      return True

    if subaction:
      subaction = ":%s" % subaction

    start_color, end_color = '', ''
    if color:
      start_color, end_color = color, self.ENDC

    print '%s[%s:%s:%s] %s%s' % (start_color, self.action, self.current_app or '', subaction, msg, end_color)

    return True


  def verbose(self, msg, subaction=None):
    if self.options.verbose and msg:
      return self.log(msg, subaction)

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

    

  def is_library_app(self, app_key):
      library_apps = AppFactory(self)('core').get_dependencies()
      
      for label, d_app in library_apps.iteritems():
          if app_key == d_app.app_key:
              return True

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

  def run_cmd(self, cmd, name='cmd', exit=True, warn=True):

    self.log(' '.join(cmd), subaction=name)
    stdout, stderr = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE).communicate()

    if stderr:
        if warn:
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
              return None

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

     #give the user rw permissions but not to group or other
     os.chmod(filename, stat.S_IRUSR | stat.S_IWUSR)

     return True


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


  def googlecode_login(self, auto_reuse_username = False):

    if self.googlecode_username and self.googlecode_password:
      return True

    username = None
    password = None

    try:
      #USERNAME
      stored_username = self.retrieve_data(site='googlecode', key='username')
      entered_username = None

      if not (stored_username and auto_reuse_username == True):
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


  def symlink(self, source, destination):

    if os.path.islink(destination):
      return True

    if os.path.exists(destination):
      return self.error('The destination symlink %s you are trying to create already exists' % destination)

    try:
      os.symlink(source, destination)
    except:
      return self.error('Error creating symlink %s ---> %s' % (destination, source))

    self.log('%s  --->  %s' % (destination, source), subaction='symlink')

    return True


class Acre:
  '''Represents a local acre instance'''

  def __init__(self, context):
    self.context = context
    self.url = None

  def read_config(self):

    c = self.context
    filename = os.path.join(c.options.acre_dir, 'config', 'project.local.conf')
    contents = None
    config = {}

    try:
      fh = open(filename, 'r')
    except:
      return c.error('Cannot open file %s for reading' % filename)
    else:
      contents = fh.read()
      fh.close()

    if not len(contents):
      return c.error('File %s has no contents' % filename)

    for line in contents.split('\n'):
      if len(line) <= 1 or line.startswith('#'):
        continue

      (key, value) = line.split('=')
      value = value.strip('"')
      config[key] = value

    return config

  def url(self):
    if self.url:
      return self.url

    #this is an acre host and port
    #e.g. myhostname.sfo:8113
    #this must be a freebaseapps-style url so that individual app versions can be addressed as
    #http://<version>.<app>.dev.<acre_host>:<acre_port>
    acre_config = self.read_config()
    ak = acre_config.keys()

    if 'ACRE_PORT' in ak and 'ACRE_HOST_BASE' in ak:
      self.url = "%s:%s" % (acre_config['ACRE_HOST_BASE'], acre_config['ACRE_PORT'])

    return self.url


  def site_dir(self):
    '''Returns the freebase site directory under the specified acre instance'''

    ad = self.context.options.acre_dir + '/_build/war/WEB-INF/scripts'
    sd = ad + '/freebase/site'

    if not os.path.isdir(sd):
      try:
        os.makedirs(sd)
      except:
        return c.error('There was a problem creating the directory %s' % SITE_DIR)

    return sd


class Site:
  '''Represents a freebase site instance'''

  def __init__(self, context):
    self.context = context
    self.config = None

  def read_config(self):

    c = self.context

    if self.config:
      return self.config

    self.config_dir =  mkdtemp()

    cmd = ['svn', 'checkout', c.SITE_SVN_URL + '/trunk/config', self.config_dir, '--username', c.googlecode_username, '--password', c.googlecode_password]
    (r, result) = c.run_cmd(cmd)

    if not r:
      return c.error(result)


    filename = self.config_dir + '/site.json'

    try:
      fd = open(filename, 'r')
    except:
      return c.error('Cannot open file %s for reading.' % filename)

    contents = fd.read()
    fd.close()

    try:
      contents = json.loads(contents)
    except:
      return c.error('Cannot JSON parse the config file %s' % filename)

    return contents


#local acre should be a singleton across the session
ACRE_INSTANCE = None

def GetAcre(context):

  global ACRE_INSTANCE

  if ACRE_INSTANCE:
    return ACRE_INSTANCE

  ACRE_INSTANCE = Acre(context)

  return ACRE_INSTANCE

SITE_INSTANCE = None
def GetSite(context):
  pass




