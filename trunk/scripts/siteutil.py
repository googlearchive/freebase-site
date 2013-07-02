#!/usr/bin/python
import sys
if sys.version_info < (2, 6):
    raise "Must use python version 2.6 or higher."

import subprocess, shutil, os, hashlib, urllib, urllib2, re, pwd, pdb, time, smtplib, socket, getpass, stat, string, json, datetime
from email.mime.text import MIMEText
from optparse import OptionParser
from tempfile import mkdtemp, mkstemp, NamedTemporaryFile
from cssmin import cssmin

# global socket timeout, seems to help connection reset issues
socket.setdefaulttimeout(60)

LICENSE_PREAMBLE = '''
/*
 * Copyright 2012, Google Inc.
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
# Obviously this is only going to work for internal employees.
USER_EMAIL_ADDRESS = "%s@google.com" % getpass.getuser()
DESTINATION_EMAIL_ADDRESS = "freebase-site@google.com"

## GLOBAL CONFIGURATION ##

# recognized extensions for static files
IMG_EXTENSIONS = [".png", ".gif", ".jpg"]
RES_EXTENSIONS = [".js", ".css", ".less"]
EXTENSIONS = IMG_EXTENSIONS + RES_EXTENSIONS + [".txt"]

JAVA = os.environ.get("JAVA_EXE", "java")
COMPILER = os.path.join(os.path.abspath(os.path.dirname(os.path.join(os.getcwd(), __file__))), "compiler.jar")
JAVA_OPTS = ["-jar", COMPILER, "--warning_level", "QUIET"]

METADATA_FILENAMES = ["METADATA.sjs", "METADATA.json"]

FREEBASE_API_KEY = "AIzaSyDTw7dTx6GifLh9LX7X6BbGICgJbfRI0s0"

class FatalException(Exception):

    def __init__(self, msg):
        self.msg = msg

    def __str__(self):
        return self.msg

class App:

  _apps = {}

  def __init__(self, context, app_key, version=None, tag=None):
    self.app_key = app_key
    self.version = version
    self.tag = tag

    self.context = context

    # Whether this app has been succesfully checked out from the repository to local disk.
    self.checked_out = False

    # The local disk directory where this app is/will be checked out.
    self.local_dir = None

  def __str__(self):
    if self.tag:
        return "%s:%s:%s" % (self.app_key, self.version, self.tag)
    elif self.version:
        return "%s:%s" % (self.app_key, self.version)
    else:
        return "%s:trunk" % self.app_key


  @classmethod
  def GetFromPath(cls, context, path):
    """
    create an app object out of a path
    e.g. //4.schema.site.freebase.dev
    """

    site = Site.GetSiteForAppId(context, path)

    parts = path[2:].split(site.conf("acre_id_suffix"))[0].split('.')

    #if this was of the form <version or tag>.<app_key>.ID_SUFFIX
    if len(parts) == 4:
      #if this was an app tag of the form 16b.<app_key>.ID_SUFFIX
      matches = re.match('(\d+)(\D)$', parts[0])
      if matches:
          return cls.Get(context, parts[1], matches.group(1), matches.group(1) + matches.group(2))
      #this was an app branch of the form 16.<app_key>.ID_SUFFX
      return cls.Get(context, parts[1], parts[0])
    else:
      return cls.Get(context, parts[0], None)

  @staticmethod
  def VersionFromTag(tag=None):
    """Return the version (branch) for a given tag or None."""

    if not tag:
      return None

    matches = re.match('(\d+)(\D)$', tag)
    if matches:
      return matches.group(1)

    return None

  @classmethod
  def Get(cls, context, app_key, version=None, tag=None):
    """Create, cache and return an app object.

    Will create the app object appropriately, cache the resulting object and return
    from the cache if the app key, version and tag are the same.

    Arguments:
      app_key: string - the app key (e.g. "lib")
      version: one of real version as string (e.g. "14"), None or "latest" as string
      tag: one of real tag as string (e.g. "14b"), None or "latest" as string

    Returns:
      app_obj: an object of the App class representing the app.
    """

    # actual_tag will hold the actual tag passed to the constructor (e.g. "13b" or None)
    actual_tag = tag
    if tag == "latest":
      actual_tag = None

    # actual_version will hold the actual version passed to the constructor (e.g. "13" or None)
    actual_version = version
    if version == "latest":
      actual_version = None

    if tag and tag != "latest" and not version:
        actual_version = cls.VersionFromTag(tag)
        if not actual_version:
          return context.error("Could not create an app object out of app_key: %s app_tag: %s without an app version" % (app_key, tag))
    """
    n = "%s:%s:%s" % (app_key, version or "trunk", tag or "none")
    if cls._apps.get(n):
      return cls._apps[n]

    app_obj = cls(context, app_key, version, tag)
    """

    n = "%s:%s:%s" % (app_key, str(version), str(tag))
    if cls._apps.get(n, None):
        return cls._apps[n]

    app_obj = cls(context, app_key, actual_version, actual_tag)

    if tag == "latest":
      actual_tag = app_obj.last_tag()
      if actual_tag:
        actual_version = cls.VersionFromTag(actual_tag)
        app_obj = App.Get(context, app_key, actual_version,actual_tag)

    elif version == "latest":
      actual_version = app_obj.last_version()
      app_obj = App.Get(context, app_key, actual_version,actual_tag)

    cls._apps[n] = app_obj
    return app_obj


  @classmethod
  def InvalidateLatest(cls,app_key):
    """Will remove the 'latest' entries fromt the cache for this app.

    This function is useful if you are creating new branches and/or tags of apps.
    When a new branch is created, any 'latest' references to the app will be out of date,
    since now the latest has changed. Hence, we need to invalidate any references in the
    in-memory cache of this app, so the next call to App.Get() will re-evaluate the 'latest' version.

    Arguments:
      cls: object representing the class (in this case the App class)
      app_key: string - an app_key, such as 'lib'

    """

    for key in cls._apps.keys():
      if key.startswith("%s:" % app_key) and ":latest" in key:
        cls._apps[key] = None

  def path(self, short=False):

    site = self.app_site()
    if not site:
        return self.context.error("Couldn't resolve site.")

    suffix = site.conf("acre_id_suffix")

    if short:
        suffix = ''

    if self.tag:
      return "//%s.%s.www.tags%s" % (self.tag, self.app_key, suffix)
    elif self.version:
      return "//%s.%s.www.branches%s" % (self.version, self.app_key, suffix)
    else:
      return "//%s.www.trunk%s" % (self.app_key, suffix)


  def app_dir(self):
    """Returns the path that acre would look under to find this app in the file system."""

    site = self.app_site()
    if not site:
      return self.context.error("Couldn't resolve site.")

    parts = site.conf("acre_id_suffix")[1:].split('.')[0:-1]
    parts.reverse()

    if self.app_key == "environments":
        parts.extend(["environments"])
    elif self.tag:
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

  def statify_css(self, filename):
    '''
    For a given filename, it will call the local acre instance
    to generate the concatanated css file, minify the result,
    and then replace the file with the new contents in-place in the file system.
    '''
    c = self.context
    file_url = "%s/%s" % (self.static_url(), filename)
    #write back to the *svn checkout directory - not to the local acre directory*
    response = c.fetch_url(file_url, acre=True)
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

    response = c.fetch_url(file_url, acre=True)
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
    compiled_output = fh.read()
    if not compiled_output:
        return c.error('Failed to compile js file %s' % js_path)
    file_contents = LICENSE_PREAMBLE + compiled_output
    fh.close()
    return self.write_file(filename, file_contents)


  def statify(self):

    c = self.context

    #this will make sure that the manifest handler will parse .mf.* files
    result = self.update_handlers(static = False)

    if not result:
        return c.error('Cannot create static resources for %s - error opening/parsing the app metadata file' % self)
    self.copy_to_acre_dir()

    d_app = self.dependency()
    while (d_app):
      d_app.copy_to_acre_dir()
      d_app = d_app.dependency()

    #routing still happens with the trunk version of lib
    #since we are using the devel environment to run acre locally

    App.Get(c, "lib", version=None).copy_to_acre_dir()
    App.Get(c, "environments", version=None, tag=None).copy_to_acre_dir()

    #app files will be a list of file paths starting at the app route
    #i.e. app.svn_path()/<file> is the actual path on disk
    app_files = self.get_app_files()

    c.log("Creating static bundles for %s" % self, color=c.BLUE)

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

    self.update_handlers(static = True, cache_forever = True)


    if not len(static_files):
        c.log('No static files generated')
        (r, result) = self.svn_commit(msg = 'updated static handlers and cache forever')
    else:
        (r, result) = self.svn_commit(msg = 'updated static handlers, cache forever, created static files:  %s' % ' '.join(static_files))

    if not r:
        return c.error("Failed to commit handlers and static files for %s" % self)

    return True


  def read_file(self, filename, isjson=False, warn=True):

    contents = ''

    svn_path = self.svn_path()
    if not svn_path:
        return (self.context.error('Cannot checkout the app from SVN'), contents)

    filename = "%s/%s" % (self.svn_path(), filename)

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

  def update_dependency(self, dependency_app):
    '''
    update the dependency app of this app to the app passed
    '''
    metadata = self.read_metadata()

    #fail silently if there is no metadata dependencies to update
    if not metadata or not ("mounts" in metadata.keys() and dependency_app.app_key in metadata["mounts"].keys()):
      return False

    metadata['mounts'][dependency_app.app_key] = dependency_app.path()

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
            "handler": "css_manifest",
            "media_type" : "text/css"
            },
        "mf.js": {
            "handler": "js_manifest",
            "media_type" : "text/javascript"
            },
        "omf.css": {
            "handler": "css_manifest",
            "media_type" : "text/css"
            },
        "omf.js": {
            "handler": "js_manifest",
            "media_type" : "text/javascript"
            }
        }

    if not metadata.get('extensions'):
        metadata['extensions'] = {}

    if static:
      #omf files never get the tagged_static handler
      handlers['mf.css']['handler'] = 'tagged_static'
      handlers['mf.js']['handler'] = 'tagged_static'
      metadata['extensions'].update(handlers)

      for file_extension in [x[1:] for x in IMG_EXTENSIONS]:
        if metadata['extensions'].get(file_extension):
          metadata['extensions'][file_extension].update({ 'handler' : 'tagged_binary' })
        else:
          metadata['extensions'][file_extension] = { 'handler' : 'tagged_binary', 'media_type' : 'image/%s' % file_extension }
    else:
      metadata['extensions'].update(handlers)

    if cache_forever:
        metadata['ttl'] = -1

    return self.write_metadata(metadata)

  def dependency(self):

    #the lib app does not have a dependency that we care about
    if self.is_lib():
      return None

    metadata = self.read_metadata()

    if metadata == False:
      return False

    #check if there is a lib dependency in the metadata['mounts'] dictionary
    if not metadata or not 'mounts' in metadata.keys():
      return None

    known_dependencies = ["site", "lib"]
    for dep_key in known_dependencies:
      if metadata["mounts"].get(dep_key):
        return App.GetFromPath(self.context, metadata["mounts"][dep_key])

    return None

  def is_lib(self):
      return self.app_key == 'lib'

  def app_site(self):
    """Returns a Site object for this app."""

    site_id = self.context.options.site
    if self.is_lib():
      site_id = "freebase-site"

    return Site.Get(self.context, site_id=site_id)

  def get_metadata_filename(self):

    files = self.get_app_files()
    for candidate in METADATA_FILENAMES:
      if candidate in files:
        return candidate

    return None

  def read_metadata(self, full_file_contents = False):

    filename = self.get_metadata_filename()

    (result, file_contents) = self.read_file(filename, isjson=False)
    if not result:
      return False

    contents = file_contents
    before = ''
    after = ''

    if filename.endswith(".sjs"):
      res = re.match('(.*var METADATA\s?=\s?)([^;]*)(.*)', file_contents, re.DOTALL)
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

    filename = self.get_metadata_filename()

    return self.write_file(filename, ''.join([before, json.dumps(metadata, indent=2), after]))


  def last_tag(self):
    '''
    Returns the last tag as a string or None if there are no tags.
    Will take into account the app version if defined.
    e.g. '15b'
    '''

    files = SVNLocation(self.context, self.svn_url(alltags=True)).ls()
    minor_tags = []

    for tag in files:
        #e.g. 16a, 16b, etc...
        matches = re.match('(\d+)(\D)$', tag)
        if matches and ((self.version and self.context.is_int(matches.group(1)) and int(matches.group(1)) == int(self.version)) or not self.version):
            minor_tags.append(matches.group(0))


    if not len(minor_tags):
        return None


    def tag_compare(tag1, tag2):

      matches1 = re.match('(\d+)(\D)$', tag1)
      matches2 = re.match('(\d+)(\D)$', tag2)

      if matches1.group(1) != matches2.group(1):
        return int(matches1.group(1)) - int(matches2.group(1))

      return matches1.group(2) > matches2.group(2)

    minor_tags.sort(cmp=tag_compare)
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

  def process_manifest_resource_file(self, filename):
    '''
    Given a filename of the form *.mf.{css,js} this function will:
    1. Substitute all references to other manifest files with their omf equivalent
    2. Create a copy of the manifest file to <original_filename>.omf.<original_extension>

    E.g. given the file path foo/bar.mf.css with contents "['lib/template/freebase.mf.css']"
    1. The contents of the file will become ['lib/template/freebase.omf.css']
    2. A second file will be created with the path foo/bar.omf.css with the new contents
       (i.e. both files will point to the omf versions of mf files)

    '''

    #nothing to do
    if not (filename.endswith('.mf.css') or filename.endswith('.mf.js')):
      return True

    c = self.context

    #utility function for converting a file path to a modified path
    #e.g. foo/bar.mf.css --> foo/bar.omf.css
    def get_modified_filename(f):
      path_parts = f.split('.mf.')
      return '.omf.'.join(path_parts)

    #first copy the file to the modified path
    target_filename = get_modified_filename(filename)
    (r, contents) = self.read_file(filename)

    if not r:
        return r

    new_mf_files = []
    rewrite = False

    #now modify the manifest file in place to point to the converted files
    try:
      mf_files = json.loads(contents)
    except:
      #theoretically, the contents of a manifest file can be actual code (css or js)
      #so we have to pass silently here
      pass
    else:
      for file_path in mf_files:
        if file_path.endswith('.mf.css') or file_path.endswith('.mf.js'):
          new_file_path = get_modified_filename(file_path)
          rewrite = True
        else:
          new_file_path = file_path

        new_mf_files.append(new_file_path)

      if rewrite:
          contents = json.dumps(new_mf_files)


    #always write the new converted filename
    r = self.write_file(target_filename, contents=contents)

    if not r:
        return r

    #if necessary, also overwrite the original file's contents
    if rewrite:
        return self.write_file(filename, contents = contents)

    return True

  def create_branch(self, dependency=None):

    c = self.context

    success = c.googlecode_login()
    if not success:
      raise FatalException("You must provide valid google code credentials in order to branch an app.")

    target_version = self.next_version()
    if not target_version:
      return c.error("Cannot figure out next valid version of %s to branch to" % self.app_key)
    else:
      c.verbose("Next available version for app %s is %s" % (self.app_key, target_version))

    target_app = App.Get(c, self.app_key, version=target_version)

    #if this version does not exist in svn, trying to get the local disk svn path will return false
    #this is forcing a checkout, but it's ok because we are going to need to do that anyway down the road
    path = target_app.svn_path(warn=False)

    if path:
      c.log("%s already exists in SVN - not branching" % target_app)
      return target_app

    msg = '[sitedeploy] Creating branch %s' % target_app
    c.log(msg, color=c.BLUE)

    cmd = c.add_svn_credentials(["svn", "copy", self.svn_url(), target_app.svn_url(), "--parents", "-m", c.quote(msg)])
    (r, output) = c.run_cmd(cmd)

    if not r:
      return False

    #if this is not the core app, and it depends on core
    #then branch the core app and update the version number in our app
    d_app = target_app.dependency()
    if d_app:
      d_app = App.Get(c, d_app.app_key, version=dependency)
      updated = target_app.update_dependency(d_app)
      if updated:
        (r, contents) = target_app.svn_commit(msg="updated %s dependency to %s" % (d_app.app_key, d_app.version))
        c.log("Created branch %s linked to %s:%s" % (target_app, d_app.app_key, d_app.version), color=c.BLUE)
      else:
        c.error("There was an error updating the %s dependency of %s" % (d_app.app_key, target_app))
    else:
      c.log("Created %s" % target_app, color=c.BLUE)

    # Always do this when creating a new branch or tag of an app.
    App.InvalidateLatest(self)

    return target_app

  def create_tag(self):
    """
    Will create a new tag of the app.

    Returns:
      tagged_app: App object - an object representing the tagged app
    """

    c = self.context

    c.log("Creating tag for %s" % self, color=c.BLUE)

    success = c.googlecode_login()
    if not success:
      raise FatalException("You must provide valid google code credentials to create an app tag.")

    d_app = self.dependency()

    if d_app == False:
      raise FatalException("There was an error evaluating the dependency app of %s" % self)

    #now create the new tag
    next_tag = self.next_tag()
    msg = '[sitedeploy] Creating tag %s' % next_tag
    tag_app = App.Get(c, self.app_key, tag=next_tag)

    if not tag_app:
      raise FatalException("There was an error creating a new tag for %s" % self)

    cmd = c.add_svn_credentials(['svn', 'copy', self.svn_url(), tag_app.svn_url(), '--parents', '-m', c.quote(msg)])
    (r, output) = self.context.run_cmd(cmd)

    if not r:
        return r

    new_files = []
    for filename in tag_app.get_app_files():
      if filename.endswith(".mf.css") or filename.endswith('.mf.js'):
        #manifest css and js files need special handling when creating a tag
        r = tag_app.process_manifest_resource_file(filename)

        if not r:
          return r

        new_files.append(filename)

    if len(new_files):
        tag_app.svn_commit(msg = 'Modified manifest resource files: %s' % ' '.join(new_files))

    #set the app object that is going to be used for here onwards
    #by any other stage
    c.set_app(tag_app)

    # Update this app's metadata to point to the latest version of its dependency apps (site, lib)
    if d_app:
      d_app = App.Get(c, d_app.app_key, version=d_app.version, tag="latest")
      update = tag_app.update_dependency(d_app)
      if update:
        (r, contents) = tag_app.svn_commit(msg="updated dependencies for %s" % tag_app)
        if r:
          c.log("Created tag %s linked to %s" % (tag_app, d_app))
        else:
          return c.error("Failed to commit to SVN - aborting")
      else:
        self.remove_from_svn()
        return c.error("There was an error updating the lib dependency of %s" % tag_app)


    # Always do this when creating a new branch or tag of an app.
    App.InvalidateLatest(self)
    return tag_app

  def svn_commit(self, path=None, msg=None):

    c = self.context

    if path == None:
      path = self.svn_path()

    if not msg:
      msg = '[sitedeploy] committing %s' % self
    else:
      msg = '[sitedeploy] %s' % msg

    cmd = c.add_svn_credentials(['svn', 'commit', '-m', c.quote(msg), path])
    return c.run_cmd(cmd, name='commit app')


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

  def last_version(self):
    return int(self.next_version() - 1)

  def next_version(self):

    files = SVNLocation(self.context, self.svn_url(allversions=True)).ls()
    versions = [int(v) for v in files if self.context.is_int(v)]

    if len(versions):
      versions.sort()
      return int(versions[-1]) + 1

    return 1


  def svn_url(self, allversions=False, alltags=False):
    """
    Returns the SVN url of the current app.
    """
    c = self.context

    svn_url_root = self.app_site().conf("svn_url")

    if allversions:
        return '{svn_url_root}/branches/www/{app}'.format(svn_url_root=svn_url_root, app=self.app_key)
    elif alltags:
        return '{svn_url_root}/tags/www/{app}'.format(svn_url_root=svn_url_root, app=self.app_key)
    #special path for environments
    elif self.app_key == "environments":
        return '{svn_url_root}/environments'.format(svn_url_root=svn_url_root)
    elif not self.version:
        return '{svn_url_root}/trunk/www/{app}'.format(svn_url_root=svn_url_root, app=self.app_key)
    elif not self.tag:
        return '{svn_url_root}/branches/www/{app}/{version}'.format(svn_url_root=svn_url_root, app=self.app_key, version=self.version)
    else:
        return '{svn_url_root}/tags/www/{app}/{tag}'.format(svn_url_root=svn_url_root, app=self.app_key, tag=self.tag)


  def remove_from_svn(self):
    c = self.context
    cmd = c.add_svn_credentials(['svn', 'rm', '-m', c.quote('[sitedeploy] action failed - removing'), self.svn_url()])
    return self.context.run_cmd(cmd)


  def copy(self, target_dir):
    """
    will copy the app from its checked out directory to the target directory
    and then get rid of the .svn directory
    it will REMOVE the target directory before copying the app over first
    """

    c = self.context

    if os.path.isdir(target_dir):
      if c.options.prevent_overwrite:
        return
      else:
        try:
          shutil.rmtree(target_dir)
        except:
          return c.error('Cannot copy app to existing directory %s (cannot delete directory first)' % self)

    #try:
    #  os.makedirs(target_dir)
    #except:
    #  return c.error('There was a problem creating the directory %s - cannot copy app to appengine directory.' % target_dir)

    path = self.svn_path()

    if not path:
        return c.error('Cannot copy %s to %s - svn checkout failed' % (self, target_dir))

    shutil.copytree(self.svn_path(), target_dir)

    def remove_unwanted_directories(directory = ''):
      """
      Removes any directories under the app directory tree that start with a .
      For example, lib/.svn, lib/routing/.svn etc...
      This will prevent all these unwanted files from being bundled with appengine
      during a deployment with local files.
      """
      for f in os.listdir(os.path.join(target_dir, directory)):
        if f.startswith('.') or (self.context.action == "deploy_acre" and f in ["js", "css", "mjt"]):
          shutil.rmtree(os.path.join(target_dir, directory, f))
          continue

        if os.path.isdir(os.path.join(target_dir, directory, f)):
          remove_unwanted_directories(os.path.join(directory, f))

    remove_unwanted_directories()

    return True

  def copy_to_acre_dir(self, war=False):
    target_dir = Acre.Get(self.context).site_dir(war=war) + '/' + self.app_dir()
    return self.copy(target_dir)

  def svn_path(self, warn=True):
    """
    creates a directory and checks out the path
    returns the directory where the app is checked out
    the local path is remembered for future use
    """

    if self.checked_out:
      return self.local_dir

    if not self.local_dir:
      self.local_dir = mkdtemp()

    r = SVNLocation(self.context, self.svn_url()).checkout(self.local_dir, warn=warn)

    if not r:
      return False

    self.checked_out = True
    return self.local_dir

  def static_url(self):
    acre = Acre.Get(self.context, existing=True)
    return "http://%s:%s/static/%s" % (acre.site_host(), acre.port(), self.path()[2:])


class Context():
  BLUE = '\033[94m'
  GREEN = '\033[92m'
  RED = '\033[91m'
  GRAY = '\033[90m'
  YELLOW = '\033[93m'
  ENDC = '\033[0m'

  ACRE_SVN_URL = 'https://acre.googlecode.com/svn'

  start_time = None

  def __init__(self, options):
    self.options = options
    self.action = ''

    self.reminders = []

    if getattr(options, 'graph', False):

      try:
        from freebase.api import HTTPMetawebSession, MetawebError
      except ImportError:
        return self.error("You need to install freebase-python for this operation. http://code.google.com/p/freebase-python/source/checkout")

    try:
      from apiclient.discovery import build
    except ImportError:
      self.service = False
    finally:
      pass


    self.current_app = None
    self.app = None

    self.googlecode_username = None
    self.googlecode_password = None

    self.quiet = False
    self.acre = None

    self.log_color = self.BLUE

    #if getattr(self.options, 'app', False):
    #  self.current_app = self.app = App.Get(self, self.options.app, self.options.version, self.options.tag)


  def set_acre(self, acre):
    self.acre = acre

  def be_quiet(self):
    self.quiet = True

  def get_freebase_services(self,service):
    if 'www' in service.keys() and 'acre' in service.keys():
      return HTTPMetawebSession(service['www'], acre_service_url=service['acre'])

    return False

  def add_svn_credentials(self, cmd):
    if self.googlecode_username:
      cmd.extend(['--username', self.googlecode_username])

    if self.googlecode_password:
        cmd.extend(['--password', self.googlecode_password])

    return cmd

  def quote(self, msg):
    return '"%s"' % msg

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

  def log(self, msg, subaction='', color=None, nocontext=False):

    #global color set - this might be None too
    if not color:
        color = self.log_color

    if self.quiet:
      return True

    start_color, end_color = '', ''
    if color:
      start_color, end_color = color, self.ENDC

    if nocontext or subaction == '':
        print >> sys.stderr, '%s%s%s' % (start_color, msg, end_color)
    else:
        print >> sys.stderr, '%s%s: %s%s' % (start_color, subaction, msg, end_color)

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


  def run_cmd(self, cmd, name='cmd', warn=False, interactive=False, silent=False):

    if not silent:
        self.log(' '.join(cmd), color=self.GRAY)

    #interactive mode - stdout/stderr will go straight to the console
    if interactive:
        subprocess.Popen(cmd).communicate()
        return (True, '')

    #non-interactive mode, invocation will finish before output can be used
    stdout, stderr = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE).communicate()

    #print " output: %s" % stdout
    #print " error: %s" % stderr

    if stderr:
        if warn:
            self.log(stderr, 'stderr')
        return (False, stderr)

    return (True, stdout)


  def read_config(self, filename):
    contents = None
    config = {}

    try:
      fh = open(filename, 'r')
      contents = fh.readlines()
    except:
      return self.error('Cannot open file %s for reading' % filename)
    finally:
      if fh:
        fh.close()

    if not len(contents):
        return self.error('Could not read %s' % filename)

    for line in contents:
      if len(line) <= 1 or line.startswith('#'):
        continue

      line = line.strip()
      (key, value) = line.split('=')

      value = value.replace("\"", "")

      config[key] = value

    return config


  def duration_human(self, date):
    seconds = date.seconds
    if not seconds:
        return '1 second'
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


  def fetch_url(self, url, isjson=False, tries=3, acre=False, silent=False, wait=1):

    #request = urllib2.Request(url, headers = {'Cache-control': 'no-cache' })
    request = urllib2.Request(url)
    contents = None
    while tries > 0:
      try:
        self.log("Fetching URL: %s" % url)
        fd = urllib2.urlopen(request, timeout=60.0)
        contents = []
        for l in fd:
            contents.append(l)
        break
      except Exception as ex:
        if not silent:
          self.log(' %s: fetchurl failed, trying with curl binary...' % str(ex), color=self.YELLOW)
        outlog = NamedTemporaryFile()
        subprocess.Popen(['curl', '-s', url], stdout=outlog, stderr=outlog).wait()
        fd = open(outlog.name)
        contents = fd.readlines()
        fd.close()

        if not len(contents):
           if not silent:
               self.error("%s\n%s" % (url, str(ex)), subaction='fetch url error')
           if acre and not 'connection reset by peer' in str(ex):
               Acre.Get(self).display_error_log(url)
           if tries:
               tries -= 1
               time.sleep(wait)
           if not silent:
               self.log('Trying again....')
        else:
           break

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


  def googlecode_login(self):

    if self.googlecode_username and self.googlecode_password:
      return True

    username = None
    password = None

    try:
      #USERNAME
      stored_username = self.retrieve_data(site='googlecode', key='username')
      if self.options.user:
          stored_username = self.options.user
      entered_username = None

      if not stored_username:
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



  def mqlread(self, query, params=None):
    #if not self.service:
    #  return self.error("Sorry, no python apiclient installed: http://code.google.com/p/google-api-python-client/wiki/Installation")
    #return self.service.mqlread()

    if not params:
      params = {}
    params['query'] = json.dumps(query)
    params['key'] = FREEBASE_API_KEY

    url = "https://www.googleapis.com/freebase/v1/mqlread?%s" % urllib.urlencode(params)

    return self.fetch_url(url, isjson=True)


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

  def pprint_table(self, table):
    """Prints out a table of data, padded for alignment
    @param table: The table to print. A list of lists.
    Each row must have the same number of columns. """
    col_paddings = []

    def get_max_width(table, index):
      return max([len(str(row[index])) for row in table])

    for i in range(len(table[0])):
        col_paddings.append(get_max_width(table, i))

    for i,row in enumerate(table):
        # left col
        print row[0].ljust(col_paddings[0] + 1),
        # rest of the cols
        for j in range(1, len(row)):
            col = str(row[j]).rjust(col_paddings[j] + 2)
            print col,
        if not i:
          print "\n" + "-" * (sum(col_paddings) + sum(len(x) for x in table[0]) - len(table[0])-1)
        else:
          print




class Acre:
  '''Represents a local acre instance'''

  _standard_port = "9999"

  # local acre should be a singleton across the session
  _acre_instance = None

  def __init__(self, context):
    self.context = context
    self.host_url = None

    self._acre_dir = None
    if context.options.acre_dir:
        self._acre_dir = context.options.acre_dir

    self._acre_port = self._standard_port

    # will hold instances of Popen objects
    # these are handlers to the current running acre process
    self._acre_process = None

    self.log = NamedTemporaryFile()


  @classmethod
  def Checkout(cls, context, acre_version, target_dir=None):

    c = context

    try:
      if target_dir:
        absolute_target_dir = os.path.expanduser(target_dir)

        if os.path.isdir(absolute_target_dir):
          raise FatalException("The directory %s that you specified already exists. Cannot checkout acre in an existing directory." % target_dir)
        else:
          os.mkdir(absolute_target_dir)

      else:
        dir_suffix = "-acre-%s-%s" % (acre_version, str(datetime.datetime.now())[:19].replace(" ", "-").replace(":", "-"))
        absolute_target_dir = target_dir = mkdtemp(suffix=dir_suffix)

    except:
      raise FatalException("Unable to create directory %s" % target_dir)


    path = "/trunk"
    if not (acre_version == "trunk"):
        path = "/dev/%s" % acre_version

    svn = SVNLocation(c, c.ACRE_SVN_URL + path)

    c.log('Starting acre checkout')
    svn.checkout(absolute_target_dir)
    c.log('Acre checkout done')

    return target_dir

  @staticmethod
  def ValidateVersion(v):

    if v == "trunk":
      return True

    try:
      int(v)
    except:
      raise FatalException("acre_version must be either 'trunk' or a branch (integer)")

  @classmethod
  def Get(cls, context, existing=False):
    """Returns an acre object - persistent across request.

    If --acre_version is passed, an svn checkout will be attempted.
    The destination directory will be a temporary directory, or the --acre_dir if passed.
    else if --acre_dir is passed, an acre object will be returned immediately.

    existing: bool - if True, only return a pre-generated acre object and do not attempt to fetch from SVN

    Returns:
      An acre object if succesful. False if not.

    """

    if cls._acre_instance:
      return cls._acre_instance

    # If we were asked for an existing Acre object only, don't attempt to fetch acre from SVN.
    if existing:
        return False

    if not (context.options.acre_dir or context.options.acre_version):
        return context.error("In order to use Acre you have to specify at least one of \n- a valid directory with --acre_dir \n- a valid acre svn version ('trunk' or a branch name) with --acre_version.\nSpecifying both with checkout acre in the directory specified.")

    # If --acre_version was passed in command line, try to fetch acre from SVN
    # Install in --acre_dir or in a new temporary directory.
    v = context.options.acre_version

    if v:
      Acre.ValidateVersion(v)
      acre_dir = Acre.Checkout(context, v, context.options.acre_dir)
      if acre_dir:
        context.options.acre_dir = acre_dir
      else:
        return False

    # By this point, either --acre_dir was passed in with a valid acre directory
    # or we did an svn checkout and set acre_dir to the new directory.
    # If it's not set - we have a problem.
    if not context.options.acre_dir:
        return context.error("Unable to create Acre object - no directory specified.")

    cls._acre_instance = cls(context)
    return cls._acre_instance

  def build(self, target = None, config_dir = None, war=False):

    c = self.context
    c.log("Building acre under %s" % self._acre_dir)
    os.chdir(self._acre_dir)

    #by default, build for local appengine
    build_mode = "appengine-build"
    if war:
        build_mode = "appengine-build-war"

    if target and config_dir and os.path.isdir(config_dir):
      cmd = ["./acre", "-c", target, "-d", config_dir, "appengine-build-config"]
      (r, result) = c.run_cmd(cmd)

      if not r:
        return c.error("Failed to configure acre."), result

    cmd = ["./acre", build_mode]
    if target and config_dir and os.path.isdir(config_dir):
        cmd = ["./acre", "-c", target, "-d", config_dir, build_mode]

    (r, result) = c.run_cmd(cmd, warn=True)

    if not r:
        return c.error("Failed to build acre."), result

    return r, result

  def deploy(self, target = None):

      c = self.context

      os.chdir(self._acre_dir)

      config_dir = os.path.join(c.options.site_dir, 'appengine-config')

      cmd = ['./acre', '-c', target, '-d', config_dir, 'appengine-deploy']
      result, stderr = self.context.run_cmd(cmd, interactive=True)
      return result

  def start(self, war=False, restart=False):

      c = self.context

      if restart:
        self.stop()
      elif self._acre_process:
        return True

      webapp = "%s/webapp" % self._acre_dir
      if war:
          webapp = "%s/_build/war" % self._acre_dir

      c.log('Starting Acre port[%s] dir[%s] log[%s]' % (self._acre_port, webapp, self.log.name), color=c.BLUE)

      if not os.environ['APPENGINE_HOME']:
          return c.error('The environment variable APPENGINE_HOME must point to your AppEngine SDK directory')

      cmd = ['%s/bin/dev_appserver.sh' % os.environ['APPENGINE_HOME'], '--disable_update_check', '--port=%s' % self._acre_port, webapp]
      c.log(' '.join(cmd), color=c.GRAY)
      try:
          self._acre_process = subprocess.Popen(cmd, stdout=self.log, stderr=self.log)
          # wait a bit for acre to start
          c.log(' ... waiting for acre to start ... ', color=c.BLUE)
          time.sleep(5)

          # and then keep trying to hit it until we get a valid response
          while not self.is_running(war):
              c.log(' ... still waiting ... ', color=c.BLUE)
              time.sleep(1)

          c.log('Acre started succesfully')
      except:
          c.error('There was an error starting the acre process')
          raise

      if self._acre_process:
          return True

      return False

  def stop(self):

    if self._acre_process:
      self.context.log('Stoping Acre', color=self.context.BLUE)
      self._acre_process.kill()
      self._acre_process = None

    self.kill_running_acre()

    return True


  def prepare_failover(self):
    '''
    We have to do 2 things:
    1. Substitute the version in _build/war/WEB-INF/web.xml to 'failover'
    2. Bundle the environments directory in the _build/war
    '''
    c = self.context

    #Mark the version as failover
    filename = self.acre_dir(war=True) + "/WEB-INF/appengine-web.xml"
    try:
      #open and read the existing file
      fd = open(filename)
      lines = fd.readlines()
      fd.close()
      #re-open the file in write mode and write all the existing data
      #but substitute the version with 'failover'
      fd = open(filename, "w")
      for line in lines:
        if line.strip()  == "<version>live</version>":
            fd.write("\t<version>failover</version>\n")
        else:
            fd.write(line)

      fd.close()
    except Exception as ex:
        return c.error("Failed to overwrite file %s:\n%s" % (filename, str(ex)))

    c.log('Changed version to failover in %s' % filename)


  def bundle_environments(self):
    #Copy the environments directory into the correct place

    c = self.context

    site = Site.Get(c)
    if not site:
        return c.error("Could not resolve site.")

    parts = site.conf("acre_id_suffix")[1:].split('.')[0:-1]
    parts.reverse()

    target_dir = os.path.join(self.acre_dir(war=True), "WEB-INF/scripts", *parts)
    target_dir = os.path.join(target_dir, 'environments')

    if os.path.isdir(target_dir):
      shutil.rmtree(target_dir)

    environments_url = site.conf("svn_url") + "/environments"

    r = SVNLocation(c, environments_url).checkout(target_dir)

    if not r:
        return c.error('Failed to svn checkout %s into %s' % (environments_url, target_dir))

    shutil.rmtree(target_dir + '/.svn')

    c.log('Copied environments file into acre: %s' % target_dir)

    return True

  def bundle_static_files(self):
    '''
    Takes static files from /trunk/static folder and copy them to correct place
    '''
    c = self.context

    site = Site.Get(c)
    if not site:
        return c.error("Could not resolve site.")

    target_dir = self.acre_dir(war=True)

    static_files_url = site.conf("svn_url") + "/trunk/static"

    r = SVNLocation(c, static_files_url).checkout(target_dir)

    if not r:
        return c.error('Failed to svn checkout %s into %s' % (static_files_url, target_dir))

    # recursively remove .svn and other 'hidden' folders
    def remove_unwanted_directories(directory=''):
      """
      Removes any directories under static directory tree that start with a .
      """
      for f in os.listdir(os.path.join(target_dir, directory)):
        if f.startswith('.'):
          shutil.rmtree(os.path.join(target_dir, directory, f))
          continue

        if os.path.isdir(os.path.join(target_dir, directory, f)):
          remove_unwanted_directories(os.path.join(directory, f))

    remove_unwanted_directories()

    c.log('Copied static files into acre: %s' % target_dir)

    return True

  def read_config(self, war=False):
    '''
    Reads the acre project.local.conf and returns its property/value pairs as a dictionary
    '''

    c = self.context
    war_path = 'webapp'
    if war:
        war_path = '_build/war'
    filename = os.path.join(self._acre_dir, war_path, 'META-INF', 'acre.properties')

    return c.read_config(filename)

  def kill_running_acre(self):
    '''
    kills a running acre on appengine instance by looking at running processes
    useful to kill stranglers that stayed up after a previous script invocation
    '''

    c = self.context
    cmd = ['ps', 'wax']
    (r, contents) = c.run_cmd(cmd, silent=True)

    for line in contents.split('\n'):

      #poor man's running acre under appengine detection
      if '--port=%s' % self._acre_port in line and 'appengine' in line and 'acre' in line:
        r = c.run_cmd(['kill', line.split()[0]], silent=True)
        time.sleep(1)
        return r


  def find_running_acre(self):
    c = self.context
    cmd = ['ps', 'wax']
    (r, contents) = c.run_cmd(cmd)

    if not r:
        return self._acre_dir

    for line in contents.split('\n'):

      parts = line.split()
      if not len(parts):
          continue

      if len(parts) > 11 and 'appengine-java-sdk' in parts[6] and 'acre' in parts[13]:
          self._acre_dir = '/'.join(parts[13].split('/')[:-1])
          break

      if parts[-1] == 'com.google.acre.Main':
        try:
          for i, v in enumerate(parts):
            if v == '-cp':
              dir_parts = parts[i+1].split('/')
              self._acre_dir =  '/'.join(dir_parts[:dir_parts.index('library')])
              c.log("Will use acre instance under %s that is currently running." % self._acre_dir, color=c.BLUE)
              break
        except:
          #something went wrong while parsing the ps line, just fail silently and let the user define the acre_dir
          continue


      if self._acre_dir:
          return True

      return False

  def acre_dir(self, war=False):

    if not self._acre_dir:
        self.find_running_acre()

    if self._acre_dir:
      if war:
        return self._acre_dir + "/_build/war"
      else:
        return self._acre_dir + "/webapp"


    return c.error('Could not find acre directory - none specified in command line, and no running acre on appengine process found.')

  def fs_routed_apps(self):
    '''
    Returns a list of app objects that are used by the environment file of this acre/fs instance
    '''

    c = self.context
    if not self.acre_dir():
      return c.error("You have not specified an acre directory with --acre_dir and a running acre instance could not be found")

    # We need a common domain to access any environment that we might be requesting, otherwise we'd have
    # to set-up local dns to match the environment's url (e.g. have dev.sandbox-freebase.com go to localhost)
    url = "http://127.0.0.1:%s/_fs_routing" % self._acre_port

    response = c.fetch_url(url, acre=True)

    if not response:
        return c.error("There is no acre running: %s" % url)

    apps = set()

    try:
      routing_table = json.loads(''.join(response))
    except:
      c.error('Failed to parse the routing table')
      return apps

    site = Site.Get(c)
    if not site:
        return c.error("Could not resolve site.")

    for label, app_id in routing_table.get('apps').iteritems():
      if site.conf("acre_id_suffix") in app_id:
        app = App.GetFromPath(c, app_id)
        if not app.svn_path():
          c.log("There is no app with id %s -- skipping." % app_id)
          continue
        apps.add(app)

        d_app = app.dependency()
        if d_app:
          apps.add(d_app)

    return apps


  def is_running(self, war=False):

    if not self._acre_process:
      return False

    c = self.context

    if not self.acre_dir():
      return c.error("You have not specified an acre directory with --acre_dir and a running acre instance could not be found")

    url = "http://127.0.0.1:%s/acre/status" % self._acre_port

    response = c.fetch_url(url, acre=True, silent=True, wait=5)

    if not response:
        c.log("There is no acre running at: %s" % url)
        return False

    return response

  def site_host(self, war=False):
    if self.host_url:
      return self.host_url

    acre_config = self.read_config(war)
    self.host_url = acre_config.get('ACRE_SITE_HOST')

    return self.host_url

  def port(self):
    return self._acre_port

  def site_dir(self, war=False):
    '''Returns the acre scripts directory under the specified acre instance'''

    #App Engine directory location
    #target_dir = self.acre_dir + '/_build/war/WEB-INF/scripts'
    #Jetty/Acre directory location
    target_dir = self.acre_dir(war) + '/WEB-INF/scripts'

    if not os.path.isdir(target_dir):
      try:
        os.makedirs(target_dir)
      except:
        return c.error('There was a problem creating the directory %s' % target_dir)

    return target_dir

  def display_error_log(self, url):

      c = self.context
      fd = open(self.log.name)

      in_request = False

      if url.startswith('http://'):
          url = url[7:]

      request_logs = []

      for line in fd:

          color = None
          line = line.rstrip()
          if 'com.google.acre.logging.AcreLogger log' in line:
              continue
          elif line.startswith('INFO [****** request *******]') and url in line:
              #reset the request logs so it will only hold the last request of this url
              request_logs = []
              in_request = True
              color = c.BLUE
          elif '[request.end]' in line:
              in_request = False
              color = c.BLUE
          elif not in_request:
              continue


          if line.startswith('ERROR') or line.startswith('SEVERE') or line.startswith('WARNING'):
              color = c.RED

          request_logs.append((line, color))

      fd.close()

      for line, color in request_logs:
          c.log(line, color=color, nocontext=True)


class Site:

  _sites = {

    "freebase-site" : {
        "notification_email_address" : "freebase-site@google.com",
        "id" : "freebase-site",
        "repository" : "googlecode",
        "svn_paths" :  [ '/environments', '/appengine-config', '/trunk/www', '/trunk/config', '/trunk/scripts'],
        "default_appengine_id" : "sandbox-freebasesite"
        },

    "freebase-refinery" : {
        "notification_email_address" : "ensemble-team@google.com",
        "id" : "freebase-refinery",
        "repository" : "googlecode",
        "svn_paths" :  ["/environments", "/appengine-config", "/trunk/www"]
        },

    "freebase-delphi" : {
        "notification_email_address" : "ensemble-team@google.com",
        "id" : "freebase-delphi",
        "repository" : "googlecode",
        "svn_paths" :  ["/environments", "/appengine-config", "/trunk/www"]
        }

    }

  _site_instance = {}

  def __init__(self, context, site_id=None):
    self.context = context

    s = context.options.site
    if site_id:
        s = site_id

    if not (s and s in self._sites.keys()):
      raise FatalException("The site %s specified is not a valid Acre Site.\nValid sites are: %s" % (s, ",".join(self._sites.keys())))

    self._conf = self._sites[s]

    self._conf.update({"acre_id_suffix": None, "svn_url" : None})

    if self._conf.get("repository", None) == "googlecode" and self._conf.get("id"):
      self._conf["acre_id_suffix"] = ".svn.%s.googlecode.dev" % self._conf.get("id")
      self._conf["acre_id_suffix_trunk"] = ".www.trunk" + self._conf["acre_id_suffix"]
      self._conf["acre_id_suffix_tags"] = ".www.tags" + self._conf["acre_id_suffix"]

      if not self._conf.get("svn_url"):
          self._conf["svn_url"] = "https://%s.googlecode.com/svn" % self._conf.get("id")

    self.site_dir = context.options.site_dir

    if (not self.site_dir) and os.path.isdir(os.path.join("..", "..", "appengine-config")):
      self.site_dir = context.options.site_dir = os.path.realpath(os.path.join("..", ".."))

  def conf(self, key):
      return self._conf.get(key, None)

  def set_site_dir(self, site_dir):
      self.site_dir = site_dir

  def apps(self):
    """Returns a list of app keys, e.g. ['lib', 'homepage']"""

    apps = SVNLocation(self.context, self.conf("svn_url") + "/trunk/www").ls()

    # Put lib in the front, so that a tag or branch for lib will be generated
    # before any other app. Since all apps depend on lib, that's necessary.
    if "lib" in apps:
      apps.remove("lib")

    apps.insert(0, "lib")

    # The test app does not need to be pushed out / branched / tagged.
    if "test" in apps:
      apps.remove("test")

    return apps

  @classmethod
  def GetSiteForAppId(cls, context, app_id):
    parts = app_id.split(".")

    # If this app_id is of the format a.b.c.d.e.site-name.googlecode.dev
    if len(parts) > 2 and parts[-1] == "dev" and parts[-2] == "googlecode":
      return Site.Get(context, site_id=parts[-3])

    return Site.Get(context)

  @classmethod
  def Get(cls, context, site_id=None):

    s = context.options.site
    if site_id:
        s = site_id

    if not cls._site_instance.get(s):
      cls._site_instance[s] = cls(context, site_id)

    return cls._site_instance[s]

  def checkout(self, destination):

    if destination.startswith("~"):
      destination = os.path.expanduser(destination)

    paths = self.conf("svn_paths")
    c = self.context
    c.log('Starting site checkout')

    done = {}

    for path in paths:

      path_parts = path.split('/')

      full_svn_path = self.conf("svn_url")
      full_local_path = destination

      for i, directory in enumerate(path_parts):

        full_local_path = os.path.join(full_local_path, directory)
        full_svn_path = os.path.join(full_svn_path, directory)

        if done.get(full_local_path):
          continue

        done[full_local_path] = True
        r = SVNLocation(c, full_svn_path).checkout(full_local_path, files = i < len(path_parts)-1)
        if not r:
          return c.error('There was an error checking out %s to %s' % (full_svn_path, full_local_path))

        c.log('Checked out: %s' % full_local_path)

    c.log('Site checkout done')

    return True

  @classmethod
  def ResolveConfig(cls, context, config, site_dir=None, host=None):
    """Returns the configuration target and the appengine-id if there is one.

    Will return the appropriate configuration target (e.g. sandbox-freebasesite) as a string.
    If host is passed as an argument, it will read through all the project.*.conf files in the
    given site appengine-config directory (optionally passed with --site_dir) and match the
    ACRE_FREEBASE_SITE_DIR value with the passed host.

    Otherwise, it will just return whatever was passed with the -c flag (config).

    Arguments
      config: string - the configuration name (e.g. sandbox-freebasesite)
      site_dir: string - the local directory of a site installation
      host: a string of a hostname (e.g. dev.sandbox-freebase.com).

    Returns
      The configuration target as a string (e.g. sandbox-freebasesite).

    """
    site_dir = cls.ResolveSiteDir(site_dir)

    if not site_dir:
        raise FatalException("You must specify --site_dir in order to figure out the correct configuration out of a host")

    if not (config or host):
        return context.error("You have to specify a valid configuration with -c or hostname with --host.")

    actual_config = None
    app_id = None

    appengine_config_dir = os.path.join(site_dir, "appengine-config")

    if config or not host:
      actual_config = config
    else:
      # Find the appengine-config directory if it exists
      if os.path.isdir(appengine_config_dir):
        domain = host.split(":")[0]
        # Loop through all the files and find the project.*.conf files in the directories
        for f in os.listdir(appengine_config_dir):

          if f.startswith(".") or not os.path.isdir(os.path.join(appengine_config_dir, f)):
            continue

          if os.path.exists(os.path.join(appengine_config_dir, f, "project.conf")):
            env_config = context.read_config(os.path.join(appengine_config_dir, f, "project.conf"))

            # If the project.conf file has this host as ACRE_SITE_HOST then the directory name
            # is the name of the configuration target.
            if env_config.get("ACRE_SITE_HOST", None) == domain:
              actual_config = f
              break


    if not actual_config:
        raise FatalException("Could not find valid configuration - config: %s host: %s." % (config,host))


    env_config = context.read_config(os.path.join(appengine_config_dir, actual_config, "project.conf"))
    app_id = env_config.get("APPENGINE_APP_ID", None)
    app_version = env_config.get("APPENGINE_APP_VERSION", None)

    if not app_id:
      filename = os.path.join(appengine_config_dir, actual_config, "appengine-web.xml.in")
      try:
        fh = open(filename)
        for l in fh.readlines():
            res = re.search("<application>(.*)</application>", l)
            if res and res.groups(1):
                app_id = res.groups(1)
                continue
            res = re.search("<version>(.*)</version>", l)
            if res and res.groups(1):
                app_version = res.groups(1)
                continue
        fh.close()
      except:
        app_id = "local"

    return actual_config, app_id, app_version

  @classmethod
  def ResolveSiteDir(cls, site_dir=None):
    """Returns the path to a site checkout directory"""

    # If site_dir is not passed, try to detect if ../../appengine-config exists.
    # This code assumes we are running under freebase-site/trunk/scripts.
    if (not site_dir) and os.path.isdir(os.path.join("..", "..", "appengine-config")):
      return os.path.realpath(os.path.join("..", ".."))

    return site_dir


class SVNLocation:

  def __init__(self, context, svn_url=None):
    self.context = context

    self.svn_url = svn_url

  def ls(self):
    """
    List an SVN directory.

    Returns an array of files or subdirectories in the directory.
    """
    c = self.context

    files = []

    cmd = c.add_svn_credentials(["svn", "ls", "--verbose", self.svn_url])
    (r, result) = self.context.run_cmd(cmd)

    #the result is a series of lines like this:
    #  99777 kai              4178 Aug 12 16:18 loader-indicator-big.gif

    if r:
      for v in result.split('\n'):
        #last part of the returned line is the filname
        filename = v.split(' ')[-1].replace("/", "")
        if filename.startswith('.') or not filename:
            continue
        files.append(filename)


    return files

  def checkout(self, target_dir, files=False, warn=True):
    c = self.context

    cmd = c.add_svn_credentials(['svn', 'checkout', self.svn_url, target_dir])
    if files:
      cmd.extend(['--depth', 'files'])
    (r, result) = c.run_cmd(cmd)

    if not r:
      if "svn: invalid option" in result:
        c.error("You might have an older version of svn - please update to the latest version. The option --depth is not supported in your version.")
      else:
        if warn:
          raise FatalException(result)
        else:
          return False

    return True

  def update(self, target_dir):
    '''Returns the last revision or False'''
    c = self.context

    cmd = c.add_svn_credentials(['svn', 'update', target_dir])

    (r, result) = c.run_cmd(cmd)

    if not r:
      return c.error(result)

    return (r, result)
