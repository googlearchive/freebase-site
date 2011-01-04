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

import sys, shutil, os, urllib2, tempfile, re, pwd, pdb, stat
from optparse import OptionParser

from siteutil import Context, AppFactory, GetAcre, SERVICES
from tempfile import mkdtemp, mkstemp

try:
  import json
except ImportError:
  import simplejson as json
except ImportError:
  print "ERROR: One of json or simplejson python packages must be installed for this to work."

class SVNLocation:

  def __init__(self, context, svn_url=None, local_dir=None):
    self.context = context

    self.svn_url = svn_url
    self.local_dir = local_dir

  def checkout(self, empty=False):
    c = self.context

    cmd = ['svn', 'checkout', self.svn_url, self.local_dir, '--username', c.googlecode_username, '--password', c.googlecode_password]
    if empty:
      cmd.extend(['--depth', 'empty'])
    (r, result) = c.run_cmd(cmd)

    if not r:
      if "svn: invalid option" in result:
        c.error("You might have an older version of svn - please update to the latest version. The option --depth is not supported in your version.")
      return c.error(result)

    return True


  def update(self):
    '''Returns the last revision or False'''
    c = self.context

    cmd = ['svn', 'update', self.local_dir, '--username', c.googlecode_username, '--password', c.googlecode_password]
    (r, result) = c.run_cmd(cmd)

    if not r:
      return c.error(result)

    return (r, result)


#checkout and install acre
class ActionSetupAcre:

  def __init__(self, context):
    self.context = context

  def __call__(self):
    c = self.context

    if not c.options.acre_dir:
      return c.error('You must specify a valid directory to install acre in')

    success = c.googlecode_login()
    if not success:
      return c.error('You must provide valid google code credentials to complete this operation.')

    try:
      os.mkdir(c.options.acre_dir)
    except:
      return c.error('The directory %s already exists, or unable to create directory.' % c.options.acre_dir)


    svn = SVNLocation(c, c.ACRE_SVN_URL + '/trunk', c.options.acre_dir)

    # CHECKOUT #
    c.log('Starting acre checkout')
    r = svn.checkout()

    if not r:
      return False

    c.log('Acre checkout done')

    # CONFIGURATION #
    c.log('Starting local configuration.')

    try:
      fh = open(os.path.join(c.options.acre_dir, 'config', 'project.local.conf.sample'), 'r')
    except:
      fh.close()
      return c.error('Could not open the file %s for reading.' % os.path.join(c.options.acre_dir, 'config', 'project.local.conf.sample'))

    lines = fh.readlines()
    fh.close()

    try:
      fh = open(os.path.join(c.options.acre_dir, 'config', 'project.local.conf') , 'w')
    except:
      fh.close()
      return c.error('Could not open the file %s for writing.' % os.path.join(c.options.acre_dir, 'config', 'project.local.conf'))

    for line in lines:
      if line.startswith('ACRE_HOST_BASE='):
        fh.write('ACRE_HOST_BASE="acre.%s"\n' % c.options.acre_host)
      elif line.startswith('ACRE_HOST_SUFFIX='):
        fh.write('ACRE_HOST_SUFFIX="dev.acre.%s"\n' % c.options.acre_host)
      else:
        fh.write(line)

    fh.write('ACRE_PORT="%s"\n' % c.options.acre_port)
    fh.close()
    c.log('Done modifying configuration.')

    # BUILD #
    c.log('Starting acre build.')
    os.chdir(c.options.acre_dir)

    cmd = ['./acre', 'build']
    (r, result) = c.run_cmd(cmd)

    if not r:
      c.error('Failed to build acre. Error:')
      return c.error(result)

    c.log('*' * 65)
    c.log('')
    c.log('To run acre, type: cd %s; ./acre run -c sandbox' % c.options.acre_dir)
    c.log('And then on your browser: http://acre.%s:%s/acre/status' % (c.options.acre_host, c.options.acre_port))
    c.log('')
    c.log('*' * 65)

    return True



#checkout a site
class ActionSetupSite:

  def __init__(self, context):
    self.context = context

  def __call__(self):

    c = self.context
    if not c.options.site_dir:
      return c.error('You must specify a valid directory to install the site in')

    success = c.googlecode_login()
    if not success:
      return c.error('You must provide valid google code credentials to complete this operation.')

    try:
      os.mkdir(c.options.site_dir)
    except:
      return c.error('The directory %s already exists, or unable to create directory.' % c.options.site_dir)

    c.log('Starting site checkout')

    if c.options.branches:
      c.log('Note: this will take a while, go make a coffee....')
      svn = SVNLocation(c, c.SITE_SVN_URL, c.options.site_dir)
    else:
      try:
        os.mkdir(c.options.site_dir + '/trunk')
      except:
        return c.error('Unable to create directory.' % c.options.site_dir)

      c.log('Note: This should take a minute...')
      #first checkout the top level directory without any files/directories in it
      svn = SVNLocation(c, c.SITE_SVN_URL, c.options.site_dir)
      svn.checkout(empty=True)
      #and now checkout the trunk directory under the top level dir
      svn = SVNLocation(c, c.SITE_SVN_URL + '/trunk', c.options.site_dir + '/trunk')

    # CHECKOUT #

    r = svn.checkout()

    if not r:
      return False

    c.log('Site checkout done')

    # CONFIGURATION #
    c.log('Starting local configuration.')


    return True


#sync the local repository and create symlinks between acre <-> site for branches
class ActionLink:

  def __init__(self, context):
    self.context = context

  def __call__(self):

    c = self.context

    success = c.googlecode_login()
    if not success:
      return c.error('You must provide valid google code credentials to complete this operation.')


    if not (c.options.site_dir and c.options.acre_dir):
      return c.error('You must specify both the directory where you have set-up acre and freebase site for sync to work')


    ACRE_DIR = c.options.acre_dir + '/webapp'
    SITE_TRUNK_DIR = c.options.site_dir + '/trunk/site'
    SITE_BRANCH_DIR = c.options.site_dir + '/branches/site'

    #do freebase.ots symlink

    source_link = c.options.site_dir + '/trunk/config/ots.freebase.conf.in'
    target_link = ACRE_DIR + '/META-INF/ots.freebase.conf.in'
    c.log('Setting up freebase OTS rules.')

    r = c.symlink(source_link, target_link)
    if not r:
      return c.error('Failed to create the freebase site OTS symlink.')

    c.log('Starting acre build.')
    os.chdir(c.options.acre_dir)

    cmd = ['./acre', 'build']
    (r, result) = c.run_cmd(cmd)

    if not r:
      c.error('Failed to build acre. Error:')
      return c.error(result)

    #do site symlink

    #first link ACRE/freebase/site --> site/trunk/site

    c.log('Linking acre and site')
    acre_freebase_dir = ACRE_DIR + '/WEB-INF/scripts/freebase'

    if not os.path.isdir(acre_freebase_dir):
      try:
        os.mkdir(acre_freebase_dir)
      except:
        return c.error('Unable to create directory %s.' % acre_freebase_dir)

    source_link = SITE_TRUNK_DIR
    target_link = acre_freebase_dir + '/site'

    r = c.symlink(source_link, target_link)

    if not r:
      return c.error('There was an error linking the acre and site dirs')

    acre_freebase_dir = ACRE_DIR + '/WEB-INF/scripts/googlecode/freebase-site'

    if not os.path.isdir(acre_freebase_dir):
      try:
        os.makedirs(acre_freebase_dir)
      except:
        return c.error('Unable to create directory %s.' % acre_freebase_dir)

    source_link = c.options.site_dir
    target_link = acre_freebase_dir + "/svn"

    r = c.symlink(source_link, target_link)

    if not r:
      return c.error('There was an error linking the acre and site dirs')

    #make the released version of the routing app to be itself

    source_link = SITE_TRUNK_DIR + '/routing'
    target_link = SITE_TRUNK_DIR + '/routing/release'

    r = c.symlink(source_link, target_link)

    if not r:
      return c.error('There was an error linking the released version of the routing app to its trunk version')


    return True


#sync the local repository and create symlinks between acre <-> site
class ActionSync:

  def __init__(self, context):
    self.context = context

  def __call__(self):

    c = self.context

    success = c.googlecode_login()
    if not success:
      return c.error('You must provide valid google code credentials to complete this operation.')


    if not (c.options.site_dir and c.options.acre_dir):
      return c.error('You must specify both the directory where you have set-up acre and freebase site for sync to work')

    ACRE_DIR = c.options.acre_dir + '/webapp'
    SITE_TRUNK_DIR = c.options.site_dir + '/trunk/site'
    SITE_BRANCH_DIR = c.options.site_dir + '/branches/site'

    if not os.path.islink(ACRE_DIR + '/WEB-INF/scripts/freebase/site'):
      return c.error('You must first link this acre and site installations using sitedeploy.py link')

    if not os.path.isdir(SITE_BRANCH_DIR):
      c.log('Cannot sync site branches because they are not checked out.', color=c.BLUE)
      c.log('To checkout site branches, run this:', color=c.BLUE)
      c.log('svn checkout %s/branches %s/branches' % (c.SITE_SVN_URL, c.options.site_dir), color=c.BLUE)
      return True

    #svn update site

    svn = SVNLocation(c, local_dir=c.options.site_dir)

    (r, result) = svn.update()

    if not r:
      c.error('Something went wrong with the update')
      return c.error(result)


    #link the individual branches of each app to the trunk directory of that app
    #this will result in this structure in the disk in the end:
    #<ACRE_DIR>/webapp/WEB-INF/scripts/freebase/site --> <SITE_DIR>/trunk/site
    #   <SITE_DIR>/trunk/site/<app>/<version> ---> <SITE_DIR>/branches/site/<app>/<version>

    #inject appengine_sdk_dir into acre start file

    for app_key in os.listdir(SITE_BRANCH_DIR):

      if not (os.path.isdir(SITE_BRANCH_DIR + '/' + app_key) and os.path.isdir(SITE_TRUNK_DIR + '/' + app_key)):
        continue

      for version in os.listdir(SITE_BRANCH_DIR + '/' + app_key):
        try:
          int(version)
        except:
          continue

        c.symlink(c.options.site_dir + '/branches/site/' + app_key + '/' + version, c.options.site_dir + '/trunk/site/' + app_key + '/' + version)


    return True



class ActionStatic:

  def __init__(self, context):
    self.context = context

  def __call__(self, app=None):

    c = self.context

    if not c.options.acre_dir:
      return c.error('You must specify the acre directory for static generation.')

    success = c.googlecode_login()
    if not success:
      return c.error('You must provide valid google code credentials to complete this operation.')

    if not app:
      app = c.current_app

    if not app.tag:
      return c.error('You can only create static files for app tags')

    c.set_acre(GetAcre(c))

    acre = GetAcre(c)

    while not acre.is_running():
      c.error('The acre instance installed in %s is not running.' % c.options.acre_dir)
      cont = raw_input("Please start the server and press (c) to continue or any other key to abort:")
      if not cont or cont != 'c':
        return c.error("Could not find a running acre instance, aborting")


    #we have to do 2 things:
    #1. statify every library app 
    #(because there might client-side dependencies that are not specified int he app manifest)
    #2. statify the requested app


    #create a list of all the library apps and then this app
    app_list = []
    core_dependencies = []
    core_app = None

    if app.app_key == 'core':
      core_dependencies = app.get_dependencies()
      core_app = app
    else:
      app_dependencies = app.get_dependencies()
      if 'core' in app_dependencies.keys():
        core_app = app_dependencies['core']
        core_dependencies = app_dependencies['core'].get_dependencies() 

    if len(core_dependencies):
      for label, d_app in core_dependencies.iteritems():
        app_list.append(d_app)
        
    app_list.append(app)

    #we 'll need the manifest and core apps locally 
    #so that we can do /MANIFEST/<css/js bundle> calls 
    #for static generation
    if core_app:
      core_app.copy_to_acre_dir()
      core_dependencies['manifest'].copy_to_acre_dir()

    #for every app in the list, get its static dependencies
    #and statify each one starting at the bottom
    #in this way, if subsequent apps need to statify other library apps
    #then we are guaranteed to have done so already

    for d_app in app_list:
      if d_app.app_key == 'routing':
        continue

      static_apps = d_app.get_static_dependencies_list()

      for static_app in static_apps:
        result = static_app.statify()
        #fail if statifying any app failed
        if not result:
          return result


    return True

class ActionSetup:

  def __init__(self, context):
    self.context = context

  def __call__(self):

    c = self.context

    r = ActionSetupAcre(c)()

    if not r:
      return c.error('Acre setup failed.')

    r = ActionSetupSite(c)()

    if not r:
      return c.error('Site setup failed.')

    r = ActionLink(c)()

    if not r:
      return c.error('Link failed.')

    c.log('Setup has finished successfully.')
    c.log('If you wish to link your local acre installation with all the app branches on your filesystem, run this:', color=c.BLUE)

    if not c.options.branches:
      c.log('svn checkout %s/branches %s/branches' % (c.SITE_SVN_URL, c.options.site_dir), color=c.BLUE)

    c.log('sitedeploy.py sync --acre_dir %s --site_dir %s' % (c.options.acre_dir, c.options.site_dir), color=c.BLUE)

    return True

#set-up wildcard dns for Mac OS X only
class ActionSetupDNS:

  def __init__(self, context):
    self.context = context

  def __call__(self):
    c = self.context
    (r, result) = c.run_cmd(['uname'])

    if not 'Darwin' in result:
      c.error('Sorry, setting up wildcard DNS only works on Mac OS X')
      return c.error('To setup DNS wildcarding, please contact your DNS/IT administrator and ask them to set-up wildcard DNS for the domain acre.%s' % c.options.acre_host)
    ROOT_RESOLVER = '/etc/resolver'
    ROOT_NAMED = '/var/named'

    local_domains = ['devel.freebase.com', 'devel.sandbox-freebase.com', 'devel.branch.qa.metaweb.com', 'devel.trunk.qa.metaweb.com']

    local_domains.append(c.options.acre_host)

    if pwd.getpwuid(os.getuid())[0] != 'root':
        print "You must run this script as root."
        exit(-1)

    if not os.path.exists(ROOT_RESOLVER):
        os.mkdir(ROOT_RESOLVER)

    fh = open("%s/localhost.zone" % ROOT_NAMED)
    zone = fh.readlines()
    zone.append("* IN A 127.0.0.1")
    fh.close()

    def create_zone(domain):
        new_lines = []
        for line in zone:
            new_lines.append(line.replace('localhost', domain))

        return ''.join(new_lines)

    named_conf_fh = open('/etc/named.conf', 'r+')
    named_conf_lines = named_conf_fh.readlines()


    for domain in local_domains:

        fh = open("%s/%s" % (ROOT_RESOLVER, domain), "w")
        fh.write("nameserver 127.0.0.1")
        fh.close()

        fh = open("%s/%s.zone" % (ROOT_NAMED, domain), "w")
        fh.write(create_zone(domain))
        fh.close()

        zone_entry = '''
    zone "%s" IN {
        type master;
        file "%s.zone";
        allow-update { none; };
    };
    ''' % (domain, domain)

        if 'zone "%s" IN {\n' % domain not in named_conf_lines:
            named_conf_fh.write(zone_entry)


    named_conf_fh.close()

    #dns server on mac needs the file /etc/rndc.key to exist
    if not os.path.isfile('/etc/rndc.key'):
        os.system('rndc-confgen -a')

    #make sure localhost is in the nameserver list
    need_localhost_nameserver = True

    resolve_fh = open('/etc/resolv.conf', 'r')
    lines = resolve_fh.readlines()
    first_nameserver_line = 0
    resolve_fh.close()

    for i,line in enumerate(lines):
        #remember the line after the search statement
        if line.startswith('search '):
            first_nameserver_line = i+1

        #if we find localhost, then we are done
        if re.match("nameserver\s+127.0.0.1", line):
            need_localhost_nameserver = False
            break

    #re-open the file and inject the localhost nameserver above the other nameservers
    if need_localhost_nameserver:
        lines.insert(first_nameserver_line, 'nameserver 127.0.0.1\n')
        resolve_fh = open('/etc/resolv.conf', 'w')
        resolve_fh.write(''.join(lines))
        resolve_fh.close()


    #re-launch the dns server
    os.system('launchctl unload /System/Library/LaunchDaemons/org.isc.named.plist')
    os.system('launchctl load -w /System/Library/LaunchDaemons/org.isc.named.plist')
    os.system('dscacheutil -flushcache')

    return True


class ActionTest:

  def __init__(self, context):
    self.context = context

  def __call__(self):
    c = self.context
    
    acre = GetAcre(c)

    return acre.is_running()


class ActionCreateAppBranch():

  def __init__(self, context):
    self.context = context


  def __call__(self):
    c = self.context
    c.set_action("branch")

    success = c.googlecode_login()
    if not success:
      return c.error('You must provide valid google code credentials to complete this operation.')

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
          #this means that we 'll either get back the core app version c.options.core
          #or we 'll branch the core app to the next available version
          core_app = dependencies['core'].branch(c.options.core)
          #update the dependency of the branched app to the new core version
          #e.g. homepage:16 --> core:56 instead of homepage:trunk --> core:trunk
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
          #if the library is routing, then always point to release version
          #if branch_app.app_key == 'routing':
          #  core_app.update_dependency(label, AppFactory(c)('routing', 'release'))
          #otherwise point to the specific version that was just branched
          #else:
          core_app.update_dependency(label, branch_app)
          updated_apps.add(core_app)

        if branch_app.app_key  != 'routing':

          branch_app_dependencies = branch_app.get_dependencies()

          if not branch_app_dependencies:
              c.verbose("The app %s does not have a dependency to core" % branch_app_dependencies)
              continue

          if not (branch_app_dependencies.get('core') and branch_app_dependencies['core'].version == core_app.version):
            branch_app.update_dependency('core', core_app)
            updated_apps.add(branch_app)

      for app in updated_apps:
        app.svn_commit(msg='updated dependencies for %s' % app)

      c.log('The following branches are going to be used: ')
      for app in app_bundle:
        c.log('\t%s\t\t%s' % (app.app_key, app.version))

    return True


class ActionCreateAppTag():

  def __init__(self, context):
    self.context = context

    self.updated_apps = set()

  def tag_core_libraries(self, core_app):

    c = self.context
    
    #STEP 1: create a tag for the core app
    #or retrieve the latest tag if it already exists
    tag = core_app.last_tag()

    if not tag:
      core_app = core_app.create_tag()
      tag = core_app.tag
    else:
      core_app = AppFactory(c)(core_app.app_key, core_app.version, tag) 

    if not core_app:
      return c.error('Failed to create tag for core')

    #XXXX REMOVE AFTER DEBUGGING
    #return core_app

    #STEP 2: create a tag for each library app
    #or retrieve the latest tag if it already exists

    #this just makes sure that if we need to update the core app config file, we do so
    updated_core_app_dependency = set()

    #for each of the dependent apps of core (i.e. all the library apps)
    for label, d_app in core_app.get_dependencies().iteritems():

      #core always depends on release of routing - no tags for routing
      #if d_app.app_key == 'routing':
      #  updated_core_app_dependency.add(core_app.update_dependency(label, AppFactory(c)('routing', 'release')))
      #  continue

      #if the tag already exists, make sure the core app points to it and we are done
      lib_app = d_app.get_tag(tag)

      #tag does not exist and this is not the routing app
      #so create a new tag for this library app
      if not lib_app:
        lib_app = d_app.create_tag(tag)
        if not lib_app:
          return c.error("Failed to create tag %s for %s" % (tag, d_app))

      updated_core_app_dependency.add(core_app.update_dependency(label, lib_app))

      lib_app_dependencies = lib_app.get_dependencies()
      
      if not lib_app_dependencies:
        c.verbose("The app %s does not have a dependency to core" % lib_app)
        continue

      #update the library app to point to the correct tag of core
      if lib_app.update_dependency('core', core_app):
        self.updated_apps.add(lib_app)

    if True in updated_core_app_dependency:
        self.updated_apps.add(core_app)

    return core_app


  def __call__(self):
    c = self.context
    c.set_action("create_tag")

    success = c.googlecode_login()
    if not success:
      return c.error('You must provide valid google code credentials to complete this operation.')

    if not (c.options.app and c.options.version):
      return c.error('You have to specify a valid app and version to create a tag out of.')

    no_static = False

    if not (c.options.acre_dir):
      c.error('WARNING: You did not specify an acre directory, so static generation for this app will fail (if needed). You can always re-create static files for a given app by running sitedeploy.py static -a %s -t <tag> --acre_dir <acre_dir>' % c.options.app)
      no_static = raw_input("Would you like to bypass static generation and continue ? (y to continue, n to abort):")
      if no_static == 'y':
        no_static = True
      else:
        return False

    if not no_static:
      acre = GetAcre(c)
      while not acre.is_running():
        c.error('The acre instance installed in %s is not running.' % c.options.acre_dir)
        cont = raw_input("Please start the server and press (c) to continue or any other key to abort:")
        if not cont or cont != 'c':
          return c.error("Could not find a running acre instance, aborting")
        
    c.log('Creating tag for %s:%s' % (c.app.app_key, c.options.version), color=c.BLUE)

    #first make sure we are not asked to branch a library app
    #you should only be able to branch a page app, or core (all libraries together)
    #XXXX REMOVE AFTER DEBUGGING
    if False and c.is_library_app(c.options.app):
      return c.error('You cannot create a tag of a library app on its own')

    #first create a tag for the app that was specified in the command line
    from_branch_app = AppFactory(c)(c.options.app, c.options.version)
    tag_app = from_branch_app.create_tag()

    if not tag_app:
      return c.error("There was an error creating a new tag for %s" % from_branch_app)

    #set the app object that is going to be used for here onwards
    #by any other stage
    c.set_app(tag_app)

    core_app = None
    #if this is not the core app, and it depends on core
    #then branch the core app and update the version number in our app
    if tag_app.app_key != 'core':
      dependencies = tag_app.get_dependencies()
      if dependencies and 'core' in dependencies.keys():
        core_app = self.tag_core_libraries(dependencies['core'])
        
        #error
        if not core_app:
          return c.error('A library app failed to create a new tag - aborting')

        if tag_app.update_dependency('core', core_app):
          self.updated_apps.add(tag_app)
    else:
      core_app = self.tag_core_libraries(tag_app)
      #error
      if not core_app:
        return c.error('A library app failed to create a new tag - aborting')


    for app in self.updated_apps:
      (r, result) = app.svn_commit(msg='updated dependencies for %s' % app)
      if not r:
        return c.error('Failed to commit CONFIG file for %s - WARNING: this will leave this tag in an inconsistent state. You should create a new tag for this app' % app)

    c.log('The following tags are going to be used: ')
    for app in self.updated_apps:
      c.log('\t%s\t\t%s' % (app.app_key, app.tag))

    if not no_static:
      ActionStatic(c)(app=tag_app)

    return True

class ActionInfo:
  '''information about apps and versions'''

  def __init__(self, context):
    self.context = context
    context.no_email()
    context.be_quiet()


  def info_app(self):
    c = self.context
    app = self.context.app

    #print "_" * 84
    print "App: %s" % app.app_key

    last_version = app.last_svn_version()
    dep = {}

    if not last_version: 
      return True

    if last_version and app.app_key != 'core':
        dep = AppFactory(c)(app.app_key, last_version).get_dependencies()

    if dep and dep.get('core'):
      last_version_str = "%s (%s)" % (last_version, dep.get('core').version)
    else:
      last_version_str = "%s" % last_version

    print "Last Version:\t\t%s" % last_version_str

    versioned_app = AppFactory(c)(app.app_key, last_version)
    last_tag = versioned_app.last_tag()

    if last_tag and app.app_key != 'core':
      dep = AppFactory(c)(versioned_app.app_key, last_version, last_tag).get_dependencies()

    if dep and dep.get('core'):
      last_tag_str = "%s (%s)" % (last_tag, dep.get('core').tag)
    else:
      last_tag_str = "%s" % last_tag

    print "Last Tag:\t\t%s" % last_tag_str

    print
    return True

  def info_all_apps(self):
    c = self.context
    app = self.context.app

    return True

  def __call__(self):

    c = self.context

    success = c.googlecode_login(auto_reuse_username=True)
    if not success:
      return c.error('You must provide valid google code credentials to complete this operation.')

    if c.options.app:
      return self.info_app()
    else:
      return self.info_all_apps()





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
      ('setup_acre', 'create a local acre instance', ActionSetupAcre),
      ('setup_site', 'create a local site instance', ActionSetupSite),
      #('setup_appengine', 'create a local appendine instance of acre/site', ActionSetupAppengine),
      ('sync', 'connect acre and site so that acre will read all branches from the filesystem', ActionSync),
      ('link', 'connect acre and site so that acre will read site trunk apps from the filesystem', ActionLink),
      ('setup', 'setup acre, site and link', ActionSetup),
      ('setup_dns', 'setup wildcard dns for your host - Mac OS X only', ActionSetupDNS),
      ('static', 'static', ActionStatic),
      ('release', 'release a specific version of an app', ActionRelease),
      ('info', 'provide information on all apps or a specific app', ActionInfo),
      ('create_branch', 'creates a branch of your app', ActionCreateAppBranch),
      ('create_tag', 'creates a tag of your app', ActionCreateAppTag),
      ('create_static', 'creates a static bundle and writes it to the provided tag', ActionStatic),

      ('test', 'test', ActionTest)
      ]


  usage = '''%prog action [options]
\nActions:
'''
  usage += '\n'.join(['\t%s\t%s' % a[:2] for a in valid_actions])

  parser = OptionParser(usage=usage)
  parser.add_option('-u', '--user', dest='user',
                    help='google code username - e.g. johnsmith@gmail.com')
  parser.add_option('-p', '--password', dest='password',
                    help='google code password')
  parser.add_option('-b', '--verbose', dest='verbose', action='store_true',
                    default=False, help='verbose mode will print out more debugging output')
  parser.add_option('', '--branches', dest='branches', action='store_true',
                    default=False, help='checkout branches when setting up a site')
  parser.add_option('', '--acre_dir', dest='acre_dir',
                    default=None, help='the local acre directory')
  parser.add_option('', '--acre_host', dest='acre_host',
                    default='z', help='the hostname that you will use to address this acre installation')
  parser.add_option('', '--site_dir', dest='site_dir',
                    default=None, help='the local site directory')
  parser.add_option('', '--acre_port', dest='acre_port',
                    default=8115, help='the port you want to serve acre from')
  parser.add_option('-v', '--version', dest='version', default=None,
                    help='a version of the app - e.g. 12')
  parser.add_option('-t', '--tag', dest='tag', default=None,
                    help='a tag of the app - e.g. 12b')
  parser.add_option('-a', '--app', dest='app', default=None,
                    help='an app id - e.g. /user/namesbc/mysuperapp or an app key under /freebase/site - e.g. homepage')
  parser.add_option('-c', '--core', dest='core', default=None,
                    help='the version of core you want to tie this app branch to')

  (options, args) = parser.parse_args()

  #there was no action specified
  if not len(args) or args[0] not in [a[0] for a in valid_actions]:
    parser.error('You did not provide a valid action')
    exit(-1)


  context = Context(options)
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

    for reminder in context.reminders:
        context.log(reminder, 'reminder', color=context.RED)

if __name__ == '__main__':
    main()
