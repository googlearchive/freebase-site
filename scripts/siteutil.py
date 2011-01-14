#!/usr/bin/python
import sys
if sys.version_info < (2, 6):
    raise "Must use python version 2.6 or higher."

import subprocess, shutil, os, hashlib, urllib, urllib2, tempfile, re, pwd, pdb, time, smtplib, socket, getpass, stat, string, json
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
METADATA_FILE = 'METADATA.sjs'
METADATA_LIB_FILE = 'METADATA.json'
FIRST_LINE_REQUIRE_CONFIG = 'var config = JSON.parse(acre.require("CONFIG.json").body);'

ACRE_ID_SVN_SUFFIX = ".svn.freebase-site.googlecode.dev"
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
      
    #separator = ACRE_ID_GRAPH_SUFFIX
    #if ACRE_ID_SVN_SUFFIX in path:  
    #separator = ACRE_ID_SVN_SUFFIX

    parts = path[2:].split(ACRE_ID_SVN_SUFFIX)[0].split('.')

    #if this was of the form <version or tag>.<app_key>.ID_SUFFIX
    if len(parts) == 4:
      #if this was an app tag of the form 16b.<app_key>.ID_SUFFIX
      matches = re.match('(\d+)(\D)$', parts[0])
      if matches:
          return self(parts[1], matches.group(1), matches.group(1) + matches.group(2))
      #this was an app branch of the form 16.<app_key>.ID_SUFFX
      return self(parts[1], parts[0])
    else:
      return self(parts[0], None)

  #return an App object
  def __call__(self, app_key, version=None, tag=None):

    if tag and not version:
      matches = re.match('(\d+)(\D)$', tag)
      if matches:
        return self(app_key, version = matches.group(1), tag=tag)
      else:
        return self.c.error('Could not create an app object out of app_key: %s app_tag: %s without an app version' % (app_key, tag))

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

    self.context = context
    self.checked_out = False
    self.local_dir = None
    self.local_deployed_dir = None
    self.environment = None

    self.needs_static_generation = True
    self.pending_static_hash = None
    self.done_static_generation = False

  def __str__(self):
    if self.tag:
        return "%s:%s:%s" % (self.app_key, self.version, self.tag)
    elif self.version:
        return "%s:%s" % (self.app_key, self.version)
    else:
        return "%s:trunk" % self.app_key

  def path(self):

    if self.tag:
      return "//%s.%s.www.tags%s" % (self.tag, self.app_key, ACRE_ID_SVN_SUFFIX)
    elif self.version:
      return "//%s.%s.www.branches%s" % (self.version, self.app_key, ACRE_ID_SVN_SUFFIX)
    else:
      return "//%s.www.trunk%s" % (self.app_key, ACRE_ID_SVN_SUFFIX)


  def app_dir(self):
      
    parts = ACRE_ID_SVN_SUFFIX[1:].split('.')[0:-1]
    parts.reverse()

    if self.tag:
      parts.extend(['tags', 'www', self.app_key, self.tag])
    elif self.version:
      parts.extend(['branches', 'www', self.app_key, self.version])
    else:
      parts.extend(['trunk', 'www', self.app_key])

    return "/".join(parts)

  def get_app_files(self):
    '''
    returns a list of filenames routed at the top of the app
    e.g. ['index.mjt', 'mydir/foobar.sjs']
    '''
    files = []
    def scan_directory(directory = ''):
      
      for f in os.listdir(os.path.join(self.svn_path(), directory)):
        if f.startswith('.'):
          continue

        if os.path.isdir(os.path.join(self.svn_path(), directory, f)):
          scan_directory(os.path.join(directory, f))

        files.append(os.path.join(directory, f))
      

    scan_directory()
    return files

  def last_resource_revision(self):
    '''
    Will go through the revision of all resource files and return the latest one
    '''
    revision = 0
    cmd = ['svn', 'ls', '--verbose', self.svn_url()]
    (r, result) = self.context.run_cmd(cmd)

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

      if self.context.is_int(parts[3]) and int(parts[3]) > revision:
        revision = sint(parts[3])

    return revision

  def statify_css(self, filename):
    '''
    For a given filename, it will call the local acre instance
    to generate the concatanated css file, minify the result, 
    and then replace the file with the new contents in-place in the file system. 
    '''

    c = self.context

    file_url = "%s/%s" % (self.static_url(), filename)
    #write back to the *svn checkout directory - not to the local acre directory*
    response = c.fetch_url(file_url)
    if not response:
      return c.error("Failed to get valid response from acre for %s" % file_url)

    file_contents = LICENSE_PREAMBLE + cssmin(''.join(response))
    return self.write_file(filename, file_contents)

  def statify_js(self, filename):
    '''
    For a given filename, it will call the local acre instance
    to generate the concatanated js file, run the result through the closure compiler
    and then replace the contents of the file in-place in the file system. 
    '''

    c = self.context
    file_url = "%s/%s" % (self.static_url(), filename)
    #write back to the *svn checkout directory - not to the local acre directory*
    response = c.fetch_url(file_url)
    if not response:
        return c.error("Failed to get valid response from acre for url %s - aborting" % file_url)

    self.write_file(filename, ''.join(response))
    js_path = os.path.join(self.svn_path(), filename)
    status, temppath = mkstemp()
    fh = open(temppath, 'w')
    cmd = [JAVA] + JAVA_OPTS + ["--js", js_path]
    subprocess.call(cmd, stdout=fh)
    fh.close()
    fh = open(temppath)
    file_contents = LICENSE_PREAMBLE + fh.read()
    fh.close()
    return self.write_file(filename, file_contents)


  def statify(self):

    c = self.context

    #this will make sure that the manifest handler will parse .mf.* files
    self.update_handlers(static = False)
    self.copy_to_acre_dir()
    
    lib_app = self.lib_dependency()
    
    if lib_app:
      lib_app.copy_to_acre_dir()

    #app files will be a list of file paths starting at the app route 
    #i.e. app.svn_path()/<file> is the actual path on disk
    app_files = self.get_app_files()

    c.log('Creating static bundles for %s' % self, color=c.BLUE)

    static_files = []
    for filename in app_files:

      done = False

      if filename.endswith(".mf.css"):
        done = self.statify_css(filename)
        if not done:
          return c.error('Failed to generate static files, aborting.')

      elif filename.endswith(".mf.js"):
        done = self.statify_js(filename)
        if not done:
          return c.error('Failed to generate static files, aborting.')
        
      if done:
        static_files.append(filename)

    
    if not len(static_files):
        return c.log('No static files generated')

    if len(static_files):
      self.update_handlers(static = True)
    
    (r, result) = self.svn_commit(msg = 'created static files %s' % ' '.join(static_files))

    if not r:
        return c.error("Failed to commit new static files for %s" % self)

    return True


  def read_file(self, filename, isjson=False, warn=True):

    svn_path = self.svn_path()
    if not svn_path:
        return self.context.error('Cannot checkout the app from SVN')

    filename = "%s/%s" % (self.svn_path(), filename)
    contents = ''

    try:
      fd = open(filename, 'r')
    except:
      if warn:
        self.context.warn('Cannot open file %s for reading (%s)' % (filename, self.svn_url()))
      return (False, contents)

    contents = fd.read()

    if isjson:
      try:
        contents = json.loads(contents)
      except:
        if warn:
          self.context.error('Cannot JSON parse the config file %s' % filename)
        fd.close()
        return (False, contents)

    fd.close()

    return (True, contents)


  def write_file(self, filename, contents):

    file_exists, _ = self.read_file(filename, warn=False)
    full_filename = "%s/%s" % (self.svn_path(), filename)

    try:
      fd = open(full_filename, 'w')
    except:
      self.context.warn('Cannot open file %s for writing' % filename)
      fd.close()
      return False

    fd.write(contents)
    fd.close()

    if not file_exists:
      svn_cmd = ['svn', 'add', full_filename]
      r = self.context.run_cmd(svn_cmd)
      if r:
        self.context.log('Added the file %s/%s to SVN' % (self.path(), filename))
      else:
        return self.context.error('Failed to add file %s/%s to SVN' % (self.path(), filename))

    return True

  def update_lib_dependency(self, app):
    '''
    update the dependency to the lib app of this app
    '''
    metadata = self.read_metadata()

    #fail silently if there is no metadata dependencies to update
    if not metadata or not ('mounts' in metadata.keys() and 'lib' in metadata['mounts'].keys()):
        return False

    metadata['mounts']['lib'] = app.path()

    #stamp the metadata file with additional useful SVN info
    metadata['app_key'] = self.app_key
    metadata['app_version'] = self.version
    metadata['app_tag'] = self.tag

    return self.write_metadata(metadata)

  def update_handlers(self, static = False, cache_forever = False):
    '''
    updates the metadata file to use the appropriate handlers for static files
    if static is False, it will use the manifest handlers for outputing mf.* style files dynamically
      this is the mode that we need when we generate static files when we create a tag
    if static is True, it will use the static handler for outputing pre-generated mf files and setting cache headers
      this is the mode that we need in production (i.e. in tagged apps)
    '''

    metadata = self.read_metadata()
    if not metadata:
        return self.context.error('Cannot open metadata file in order to update handlers')

    handlers =  {
        "mf.css": {
            "handler": "css_manifest"
            },
        "mf.js": {
            "handler": "js_manifest"
            }
        }
    
    if static:
      for file_extension, v in handlers.iteritems():
        v['handler'] = 'tagged_static'
      for file_extension in IMG_EXTENSIONS:
          handlers[file_extension[1:]] = { 'handler' : 'tagged_static' }

    if cache_forever:
        metadata['ttl'] = -1

    if metadata.get('extensions'):
      metadata['extensions'].update(handlers)
    else:
      metadata['extensions'] = handlers

    self.write_metadata(metadata)

  def lib_dependency(self):

    #the lib app does not have a dependency on itself
    if self.app_key == 'lib':
        return None

    metadata = self.read_metadata()

    #check if there is a lib dependency in the metadata['mounts'] dictionary
    if not metadata or not ('mounts' in metadata.keys() and 'lib' in metadata['mounts'].keys()):
        return None

    #return the lib app object by constructing it from the app path
    return AppFactory(self.context).from_path(metadata['mounts']['lib'])


  def is_lib(self):
      return self.app_key == 'lib'

  def read_metadata(self, full_file_contents = False):

    filename = METADATA_FILE
    if self.is_lib():
        filename = METADATA_LIB_FILE
        
    (result, file_contents) = self.read_file(filename, isjson=False)
    if not result:
      return False


    contents = file_contents
    before = ''
    after = ''

    if not self.is_lib():
        res = re.match('(var METADATA\s?=\s?)([^;]*)(.*)', file_contents, re.DOTALL)
        if not res:
            return self.context.error('Cannot parse metadata file for %s' % self)

        before, contents, after = res.group(1), res.group(2), res.group(3)

    try: 
      metadata = json.loads(contents)
    except:
      return self.context.error('Cannot convert metadata file of %s to json' % self)


    if full_file_contents:
        return metadata, before, after

    return metadata

  def write_metadata(self, metadata):

    _, before, after = self.read_metadata(full_file_contents = True)

    filename = METADATA_FILE
    if self.is_lib():
        filename = METADATA_LIB_FILE

    return self.write_file(filename, ''.join([before, json.dumps(metadata, indent=2), after]))      


  def last_tag(self):
    '''
    Returns the last tag as a string or None if there are no tags
    e.g. '15b'
    '''

    (r, result) = self.context.run_cmd(['svn', 'ls', self.svn_url(alltags=True)])
    if not r:
        return None

    minor_tags = []

    for tag in result.split('/\n'):
        #e.g. 16a, 16b, etc...
        matches = re.match('(\d+)(\D)$', tag)
        if matches and self.context.is_int(matches.group(1)) and int(matches.group(1)) == int(self.version):
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

    matches = re.match('\d+(\D)$', last_tag)
    return "%s%s" % (self.version, chr(ord(matches.group(1)) + 1))
      
  def create_tag(self, tag=None):
    '''
    Creates a new tag directory and copies the branched app there
    Returns an instance of the new app
    '''

    c = self.context

    if not tag:
        tag = self.next_tag()

    msg = 'Creating tag %s' % tag

    target_app = AppFactory(c)(self.app_key, version=self.version, tag=tag)

    cmd = ['svn', 'copy', self.svn_url(), target_app.svn_url(), '--parents', '-m', '"sitedeploy: %s"' % msg, '--username', c.googlecode_username, '--password', c.googlecode_password]
    (r, output) = self.context.run_cmd(cmd)

    if not r:
        return r

    return target_app
    
  def branch(self, target_version=None):

    c = self.context

    #figure out the next version if we were not given one
    if not target_version:
      target_version = self.next_svn_version()
      if not target_version:
        return c.error('Cannot figure out next valid version of %s to branch to' % self.app_key)
      else:
        c.verbose('Next available version for app %s is %s' % (self.app_key, target_version))

    target_app = AppFactory(c)(self.app_key, version=target_version)

    #if this version does not exist in svn, trying to get the local disk svn path will return false
    #this is forcing a checkout, but it's ok because we are going to need to do that anyway down the road
    path = target_app.svn_path(warn=False)

    if path:
      c.log('%s already exists in SVN - not branching' % target_app)
      return target_app

    msg = 'Creating branch version {version} of {app}'.format(version=target_app.version, app=target_app.app_key)
    c.log(msg, color=c.BLUE)
    cmd = ['svn', 'copy', self.svn_url(), target_app.svn_url(), '--parents', '-m', '"appdeploy: %s"' % msg, '--username', c.googlecode_username, '--password', c.googlecode_password]
    (r, output) = c.run_cmd(cmd)

    if not r:
      return False

    return target_app

  def svn_commit(self, path=None, msg=None):

    c = self.context

    if path == None:
      path = self.svn_path()

    if not msg:
      msg = 'committing app %s version %s' % (self.app_key, self.version)

    c.log('Committing %s to SVN' % self)
    cmd = ['svn', 'commit', '-m', msg, path, '--username', c.googlecode_username, '--password', c.googlecode_password]
    return c.run_cmd(cmd, name='commit app', exit=False)


  def get_graph_app_from_environment(self, service):

    c = self.context

    s = c.get_freebase_services(service)
    if not s:
      return c.error('Unable to instantiate freebase services.')

    try:
      return s.get_app(self.path())
    except:
      return c.error('Could not get %s from appeditor services' % self)


  def get_graph_app(self, service=None):
    '''
    get app info using  graph/appeditor/get_app service
    '''
    try:
      graph_app = c.freebase.get_app(self.path())
    except:
      if not self.version:
        c.log("%s does not exist yet, will create it" % self.app_key)
        try:
          ActionCreateGraph(self.context)(self)
          graph_app = c.freebase.get_app(self.path())
        except:
          return c.error('Cannot create %s - aborting.' % self.app_key)
      else:
        raise

    return graph_app

  def last_svn_version(self):
    return int(self.next_svn_version() - 1)

  def next_svn_version(self):
    (r, result) = self.context.run_cmd(['svn', 'ls', self.svn_url(allversions=True)])

    versions = [int(v) for v in result.split('/\n') if self.context.is_int(v)]
    if len(versions):
      versions.sort()
      return int(versions[-1]) + 1

    return 1


  def svn_static_url(self):

    if self.pending_static_hash:
      return '%s/static/%s/%s' (self.context.SITE_SVN_URL, self.app_key, self.pending_static_hash)

    return self.context.error('Cannot compute static SVN path because there is no pending static hash')

  def svn_deployed_url(self, deployed_hash):
    return '{svn_url_root}/deployed/{app}/{deployed_hash}'.format(svn_url_root=PRIVATE_SVN_URL_ROOT, app=self.app_key, deployed_hash=deployed_hash)

  def svn_url(self, allversions=False, alltags=False):

    c = self.context

    if allversions:
        return '{svn_url_root}/branches/www/{app}'.format(svn_url_root=c.SITE_SVN_URL, app=self.app_key)
    elif alltags:
        return '{svn_url_root}/tags/www/{app}'.format(svn_url_root=c.SITE_SVN_URL, app=self.app_key)
    elif not self.version:
        return '{svn_url_root}/trunk/www/{app}'.format(svn_url_root=c.SITE_SVN_URL, app=self.app_key)
    elif not self.tag:
        return '{svn_url_root}/branches/www/{app}/{version}'.format(svn_url_root=c.SITE_SVN_URL, app=self.app_key, version=self.version)
    else:
        return '{svn_url_root}/tags/www/{app}/{tag}'.format(svn_url_root=c.SITE_SVN_URL, app=self.app_key, tag=self.tag)        


  #will copy the app from its checked out directory to the target directory
  #and then get rid of the .svn directory
  #it will REMOVE the target directory before copying the app over first
  def copy(self, target_dir):

    if os.path.isdir(target_dir):
      try:
        shutil.rmtree(target_dir)
      except:
        return self.context.error('Cannot copy app to existing directory %s (cannot delete directory first)' % self)

    #try:
    #  os.makedirs(target_dir)
    #except:
    #  return c.error('There was a problem creating the directory %s - cannot copy app to appengine directory.' % target_dir)

    shutil.copytree(self.svn_path(), target_dir)
    shutil.rmtree(target_dir + '/.svn')
    return True

  def copy_to_acre_dir(self):

    target_dir = self.context.acre.site_dir() + '/' + self.app_dir()
    self.copy(target_dir)

    #if self.version:
    #  self.copy(app_dir + '/' + self.version)
    #  self.copy(app_dir + '/release')

  #checks out the app from SVN into the specified directory
  def svn_checkout(self, target_dir, warn=True):

    c = self.context

    cmd = ['svn', 'checkout', self.svn_url(), target_dir, '--username', c.googlecode_username, '--password', c.googlecode_password]
    (r, output) = c.run_cmd(cmd, exit=False, warn=warn)

    if not r:
      if warn:
          return c.error(output)
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
    return self.url(host = self.context.acre.url())

  def url(self, services = None, host = None):

    #first check if a host was provided
    if not host:
        #if not, check if services exists (i.e. a -g graph was provided that maps to hosts)
        if not services:
            services = self.context.services

        host = services['freebaseapps']

    return 'http:%s.%s' % (self.path(), host)


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

      try:
        from freebase.api import HTTPMetawebSession, MetawebError
      except ImportError:
        return self.error("You need to install freebase-python for this operation. http://code.google.com/p/freebase-python/source/checkout")

      self.services = SERVICES[options.graph]
      self.freebase = self.get_freebase_services(SERVICES.get(options.graph, {}))
      self.freebase_logged_in = False

    self.current_app = None
    self.app = None

    self.googlecode_username = None
    self.googlecode_password = None

    if getattr(self.options, 'app', False):
      self.current_app = self.app = AppFactory(self)(self.options.app, self.options.version, self.options.tag)

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

  def warn(self, msg, subaction='WARNING'):
    return self.log(msg, subaction)

  def error(self, msg, subaction='ERROR'):
    self.log(msg, subaction, color=self.RED)
    return False

  def log(self, msg, subaction='', color=None):

    if self.quiet:
      return True

    if subaction:
      subaction = ":%s" % subaction

    start_color, end_color = '', ''
    if color:
      start_color, end_color = color, self.ENDC

    print '%s[%s:%s%s] %s%s' % (start_color, self.action, self.current_app or '', subaction, msg, end_color)

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

    
  def run_cmd(self, cmd, name='cmd', exit=True, warn=True):

    self.log(' '.join(cmd), subaction=name)
    stdout, stderr = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE).communicate()

    if stderr:
        if warn:
            self.log(stderr, 'stderr')
        return (False, stderr)

    return (True, stdout)


  def duration_human(self, date):
    seconds = date.seconds
    seconds = long(round(seconds))
    minutes, seconds = divmod(seconds, 60)
    hours, minutes = divmod(minutes, 60)
    days, hours = divmod(hours, 24)
    years, days = divmod(days, 365.242199)
 
    minutes = long(minutes)
    hours = long(hours)
    days = long(days)
    years = long(years)
 
    duration = []
    if years > 0:
        duration.append('%d year' % years + 's'*(years != 1))
    else:
        if days > 0:
            duration.append('%d day' % days + 's'*(days != 1))
        if hours > 0:
            duration.append('%d hour' % hours + 's'*(hours != 1))
        if minutes > 0:
            duration.append('%d minute' % minutes + 's'*(minutes != 1))
        if seconds > 0:
            duration.append('%d second' % seconds + 's'*(seconds != 1))
    return ' '.join(duration)



  def fetch_url(self,url, isjson=False, tries=3):

    #request = urllib2.Request(url, headers = {'Cache-control': 'no-cache' })
    request = urllib2.Request(url)
    contents = None
    while tries > 0:
      try:
        self.log(url, 'fetchurl')
        contents = urllib2.urlopen(request, timeout=30).readlines()
        break
      except urllib2.HTTPError as exc:
        self.error(url, subaction='fetch url error')
        if tries:
          tries -= 1
          self.log('%s\nTrying again....' % ''.join(exc.readlines()), subaction=exc.msg)
      except urllib2.URLError as exc:
        self.error(url, subaction='fetch url error')
        if tries:
          tries -= 1
          self.log('Trying again....')

    if isjson and contents:
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
      return self.log('The destination symlink %s you are trying to create already exists' % destination)

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
    self.host_url = None

  def build(self):

    c = self.context
    os.chdir(c.options.acre_dir)
    cmd = ['./acre', 'build']
    return c.run_cmd(cmd)
      

  def read_config(self):
    '''
    Reads the acre project.local.conf and returns its property/value pairs as a dictionary
    '''

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

  def is_running(self):

    c = self.context
    acre_url = self.url()
    if not acre_url:
        return False

    url = "http://%s/acre/status" % acre_url

    response = c.fetch_url(url)

    if not response:
        return c.error("There is no acre running: %s" % url)

    return True


  def url(self):
    if self.host_url:
      return self.host_url

    #this is an acre host and port
    #e.g. myhostname.sfo:8113
    #this must be a freebaseapps-style url so that individual app versions can be addressed as
    #http://<version>.<app>.dev.<acre_host>:<acre_port>
    acre_config = self.read_config()
    if not acre_config:
        return False

    ak = acre_config.keys()

    if 'ACRE_PORT' in ak and 'ACRE_HOST_BASE' in ak:
      self.host_url = "%s:%s" % (acre_config['ACRE_HOST_BASE'], acre_config['ACRE_PORT'])

    return self.host_url



  def site_dir(self):
    '''Returns the acre scripts directory under the specified acre instance'''

    #App Engine directory location
    #target_dir = self.context.options.acre_dir + '/_build/war/WEB-INF/scripts'
    #Jetty/Acre directory location
    target_dir = self.context.options.acre_dir + '/webapp/WEB-INF/scripts'

    if not os.path.isdir(target_dir):
      try:
        os.makedirs(target_dir)
      except:
        return c.error('There was a problem creating the directory %s' % target_dir)

    return target_dir


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




