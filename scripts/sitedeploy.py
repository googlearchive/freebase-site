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

import sys, shutil, os, re, pwd, pdb, datetime
from optparse import OptionParser

from siteutil import Context, AppFactory, GetAcre, SERVICES

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

  def checkout(self, files=False):
    c = self.context

    cmd = ['svn', 'checkout', self.svn_url, self.local_dir, '--username', c.googlecode_username, '--password', c.googlecode_password]
    if files:
      cmd.extend(['--depth', 'files'])
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

  def __call__(self, build=True):
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
    
    params = { 
      'ACRE_HOST_BASE' : 'acre.%s' % c.options.acre_host,
      'ACRE_PORT' : c.options.acre_port,
      'ACRE_FREEBASE_SITE_ADDR_PORT' : c.options.acre_port
      }

    written_params = {}

    for line in lines:
      parts = line.split('=')
      if len(parts) and parts[0] in params.keys():
        fh.write('%s="%s"\n' % (parts[0], params.get(parts[0])))
        written_params[parts[0]] = True
      else:
        fh.write(line)

    for k, v in params.iteritems():
      if not written_params.get(k):
        fh.write('%s="%s"\n' % (k,v))

    fh.close()
    c.log('Done modifying configuration.')

    # BUILD #
    if build:
      r = GetAcre(c).build()
      if not r:
        return c.error('Failed to build acre at %s' % c.options.acre_dir)

    c.log('*' * 65)
    c.log('')
    c.log('To run acre, type: cd %s; ./acre appengine-run' % c.options.acre_dir)
    c.log('And then on your browser: http://acre.%s:%s/acre/status' % (c.options.acre_host, c.options.acre_port))
    c.log('')
    c.log('*' * 65)

    return True


#checkout a site
class ActionSetupSite:


  def __init__(self, context):
    self.context = context


  def checkout(self, paths):

    c = self.context
    done = {}

    for path in paths:

      path_parts = path.split('/')

      full_svn_path = c.SITE_SVN_URL
      full_local_path = self.site_checkout

      for i, directory in enumerate(path_parts):

        full_local_path = os.path.join(full_local_path, directory)
        full_svn_path = os.path.join(full_svn_path, directory)

        if done.get(full_local_path):
          continue

        done[full_local_path] = True
        r = SVNLocation(c, full_svn_path, full_local_path).checkout(files = i < len(path_parts)-1)
        if not r:
          return c.error('There was an error checking out %s to %s' % (full_svn_path, full_local_path))

        c.log('Checked out: %s' % full_local_path)

    return True


  def __call__(self):

    c = self.context
    if not c.options.site_dir:
      return c.error('You must specify a valid directory to install the site in')

    if not c.options.acre_dir:
      return c.error('You must specify an acre directory to install site in for acre on app-engine')

    success = c.googlecode_login()
    if not success:
      return c.error('You must provide valid google code credentials to complete this operation.')

    self.site_checkout = c.options.acre_dir + '/webapp/WEB-INF/scripts/googlecode/freebase-site'

    try:
      os.makedirs(self.site_checkout)
      self.site_checkout += '/svn'
    except:
      return c.error('The directory %s already exists, or unable to create directory.' % self.site_checkout)

    c.log('Starting site checkout')

    paths = [ '/environments', '/appengine-config', '/trunk/www', '/trunk/config', '/trunk/scripts']

    if c.options.everything:
      c.log('Note: this will take a while, go make a coffee....')
      paths.append('/branches/www')
      paths.append('/tags/www')

    r = self.checkout(paths)

    if not r:
      return False

    r = c.symlink(self.site_checkout, c.options.site_dir)

    c.log('Site checkout done')

    r = GetAcre(c).build(target='devel', config_dir = '%s/appengine-config' % c.options.site_dir)
    if not r:
      return c.error('Failed to build acre under %s' % c.options.acre_dir)

    c.log('*' * 65)
    c.log('')
    c.log('In order to run the freebase site:', color=c.BLUE)
    c.log('\t1. Run the acre server: \n cd %s; ./acre appengine-run' % c.options.acre_dir)
    c.log('\t2. Visit http://devel.sandbox-freebase.com:%s' % c.options.acre_port)
    c.log('freebase-site is now installed in %s' % c.options.site_dir)
    c.log('')
    c.log('*' * 65)

    return True


#sync the local repository and create symlinks between acre <-> site 
class ActionLink:
  '''
  Connect an acre directory and a freebase-site directory
  This assumes freebase-site is checked-out OUTSIDE of acre and
  then creates appropriate symlinks IN acre TO freebase-site. 
  '''

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

    #do freebase.ots symlink

    source_link = c.options.site_dir + '/trunk/config/ots.www.conf.in'
    target_link = ACRE_DIR + '/META-INF/ots.www.conf.in'
    c.log('Setting up freebase OTS rules.')

    r = c.symlink(source_link, target_link)
    if not r:
      return c.error('Failed to create the freebase site OTS symlink.')

    c.log('Starting acre build.')
    os.chdir(c.options.acre_dir)

    #do site symlink
    c.log('Linking acre and site')

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

    GetAcre(c).build()
    return True


class ActionStatic:

  def __init__(self, context):
    self.context = context

  def __call__(self, app=None):

    c = self.context

    c.set_acre(GetAcre(c))

    acre = GetAcre(c)
    if acre.build(target='devel', use_freebase_site_config = True):
      if not acre.start():
        return c.error('There was an error starting acre - cannot generate static files without a running acre instance.')
    else:
      return c.error('Failed to build acre - static generation aborted.')

    success = c.googlecode_login()

    if not success:
      return c.error('You must provide valid google code credentials to complete this operation.')

    if not app:
      app = c.current_app

    if not app.tag:
      return c.error('You can only create static files for app tags')

    r = app.statify()

    return r

class ActionDeployAcre:

  def __init__(self, context):
    self.context = context

  def __call__(self):

    c = self.context

    if not (c.options.site_dir and c.options.acre_dir):
      return c.error("Both --site_dir and --acre_dir must be provided to deploy acre.")

    if not c.options.acre_config:
      return c.error('You have to specify an acre build target with -c e.g. -c acre')

    acre = GetAcre(c)

    (r, result) = acre.build(c.options.acre_config, config_dir= "%s/appengine-config" % c.options.site_dir, war=True)

    print result

    if not r:
      return c.error("Acre failed to build, aborting.")

    acre.start(war=True)

    status = acre.is_running()

    if not status:
      return c.error('Could not start new acre war bundle under appengine development server, aborting deployment')
    
    c.log_color = c.BLUE

    c.log('*' * 65)
    c.log('')
    c.log('Acre Deployment Summary')
    c.log('')
    c.log('\tConfig: %s' % c.options.acre_config)
    c.log('\tAppEngine URL: http://%s.appspot.com/' % c.options.acre_config)
    c.log('\tAppEngine Dashboard: https://appengine.google.com/dashboard?&app_id=%s' % c.options.acre_config)
    c.log('\tFreebase Site Keystore: http://environments.svn.freebase-site.googlecode.dev.%s.appspot.com/acre/keystore_console' % c.options.acre_config)
    c.log('')
    #c.log('Freebase Site Routing:')
    #for status_line in status:
    #  status_line = status_line.rstrip('\n')
    #  c.log('\t%s' % status_line)
    c.log('')
    c.log('*' * 65)

    c.log_color = None


    if os.path.isdir(acre.site_dir(war=True) + '/googlecode'):
      shutil.rmtree(acre.site_dir(war=True)+ '/googlecode')

    if not c.options.nosite:

      apps = acre.fs_routed_apps()

      for app in apps:
        result = app.copy_to_acre_dir(war=True)
        if not result:
          c.error('Failed to copy %s to app-engine bundle, continuing with other apps...' % app)

      c.log('The following apps are bundled with acre:')
      for app in sorted(apps):
        c.log('\t%s' % app)


    c.log('Starting deployment of live version, handing off to appcfg...', color=c.BLUE)
    if not acre.deploy(): 
      return c.error('Deployment failed.')

    if c.options.failover:
      c.log('Starting deployment of failover version.', color=c.BLUE)
      r = acre.prepare_failover()
      
      if not r:
        return c.error('Failed to prepare failover version of acre, aborting.')
    
      if not acre.deploy(): 
        return c.error('Deployment failed.')
      
    return True

class ActionSetup:

  ACRE_DIR_DEFAULT = '~/acre'
  SITE_DIR_DEFAULT = '~/freebase-site'

  def __init__(self, context):
    self.context = context

  def get_directory_locations(self):

    c = self.context

    acre_dir = c.options.acre_dir or self.ACRE_DIR_DEFAULT
    site_dir = c.options.site_dir or self.SITE_DIR_DEFAULT

    name = raw_input("Enter the directory where you want to install acre (%s):" % acre_dir)
    if not name:
      name = acre_dir
      
    c.options.acre_dir = os.path.expanduser(name.strip())

    name = raw_input("Enter the directory where you want to install freebase-site (%s):" % site_dir)
    if not name:
      name = site_dir
      
    c.options.site_dir = os.path.expanduser(name.strip())


  def __call__(self):

    c = self.context

    if not (c.options.site_dir and c.options.acre_dir):
      self.get_directory_locations()

    r = ActionSetupAcre(c)(build=False)

    if not r:
      return c.error('Acre setup failed.')

    r = ActionSetupSite(c)()

    if not r:
      return c.error('Site setup failed.')

    #r = ActionLink(c)()
    #if not r:
    #  return c.error('Link failed.')

    return c.log('Setup has finished successfully.')


class ActionSetupSimpleDNS:


  def __init__(self, context):
    self.context = context

  def __call__(self):
    c = self.context

    domains = set(['environments.svn.freebase-site.googlecode.dev.acre.z', 'devel.sandbox-freebase.com'])

    if pwd.getpwuid(os.getuid())[0] != 'root':
        return c.error('You must run this script as root.')

    fh = open('/etc/hosts')
    lines = fh.readlines()
    fh.close()

    for line in lines:
      for domain in list(domains):
        if re.search('\s+%s$' % domain, line) and not line.startswith('#'):
          domains.remove(domain)
    
      if not len(domains):
        break

    if len(domains):
      fh = open('/etc/hosts', 'w')
      fh.write(''.join(lines))
      for domain in domains:
        fh.write('127.0.0.1\t%s\n' % domain)
        
      fh.close()

    return True


#set-up wildcard dns for Mac OS X only
class ActionSetupWildcardDNS:

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

    GetAcre(c).prepare_failover()

  

class ActionCreateAppBranch():

  def __init__(self, context):
    self.context = context


  def __call__(self):
    c = self.context
    c.set_action("branch")

    #you specified an app that is not lib without specifying which 
    #version of lib to connect to
    if c.options.app != 'lib' and not c.options.lib:
      return c.error('You have to specify a lib version to connect to with -l')


    success = c.googlecode_login()
    if not success:
      return c.error('You must provide valid google code credentials to complete this operation.')

    if not c.options.app:
      return c.error('You have to specify a valid app to branch')

    c.log('Starting branching app %s' % c.app.app_key, color=c.BLUE)

    #create the branch
    from_app = AppFactory(c)(c.options.app, c.options.version)
    branch_app = from_app.branch(c.options.version)

    #set the app object that is going to be used for here onwards
    #by any other stage
    c.set_app(branch_app)

    #if this is not the core app, and it depends on core
    #then branch the core app and update the version number in our app
    if not branch_app.is_lib():
      #XXX to be implemented
      updated = branch_app.update_lib_dependency(AppFactory(c)('lib', version=c.options.lib))
      if updated:
        (r, contents) = branch_app.svn_commit(msg='updated lib dependency to %s' % c.options.lib)
        c.log('Created branch %s linked to lib:%s' % (branch_app, c.options.lib), color=c.BLUE)
      else:
        c.error('There was an error updating the lib dependency of %s' % branch_app)
    else:
      c.log('Created %s' % branch_app, color=c.BLUE)


    return True

#TAG
class ActionCreateAppTag():

  def __init__(self, context):
    self.context = context

    self.updated_apps = set()

  def get_lib_tag_dependency(self, app):
    '''
    Returns a lib app object that this app tag should be linked to.
    Returns None if there is no lib dependency
    Returns False if there was an error
    '''

    c = self.context
    #first see if there is a lib dependency
    lib_app = app.lib_dependency()

    if lib_app:
      #if there was a lib tag specified in the command line, check that its
      #of the same branch as the lib app that was linked to this app branch
      if c.options.lib:
        new_lib_app = AppFactory(c)('lib', tag=c.options.lib)
        if lib_app.version != new_lib_app.version:
          return c.error('You cannot specify a lib tag that is from a different branch than when this app was created.\nOriginal lib branch: %s\nSpecified lib branch: %s' % (lib_app.version, new_lib_app.version))
        else:
          lib_app = new_lib_app
    #otherwise, try to figure out the latest tag of the lib app that was used when this app was branched
      else:
        last_tag = lib_app.last_tag()
        if not last_tag:
          return c.error("The app %s is linked to %s which has no available tags." % (app, lib_app))
        else:
          lib_app = AppFactory(c)('lib', tag=last_tag)

    return lib_app

  def __call__(self):
    c = self.context
    c.set_action("create_tag")

    if not (c.options.app and c.options.version):
      return c.error('You have to specify a valid app and version to create a tag out of.')

    if not c.options.acre_dir:
      return c.error('You have to specify an acre directory to use.')

    if not c.options.site_dir:
      return c.error('You have to specify a freebase-site directory to use.')

    success = c.googlecode_login()
    if not success:
      return c.error('You must provide valid google code credentials to complete this operation.')

    c.log('Creating tag for %s:%s' % (c.app.app_key, c.options.version), color=c.BLUE)

    #first create a tag for the app that was specified in the command line
    from_branch_app = AppFactory(c)(c.options.app, c.options.version)

    #then check if there is a valid lib tag that we can use - or if there is no
    #lib dependency
    lib_app = self.get_lib_tag_dependency(from_branch_app)
    if lib_app == False:
      return c.error('There was an error with the lib dependency')

    #now create the new tag
    tag_app = from_branch_app.create_tag()

    if not tag_app:
      return c.error("There was an error creating a new tag for %s" % from_branch_app)

    #set the app object that is going to be used for here onwards
    #by any other stage
    c.set_app(tag_app)

    #if this is not the core app, and it depends on core
    #then branch the core app and update the version number in our app
    if not tag_app.is_lib():

      if lib_app:
        update = tag_app.update_lib_dependency(lib_app)
        if update:
          (r, contents) = tag_app.svn_commit(msg='updated dependencies for %s' % tag_app)
          if r:
            c.log('Created tag %s linked to %s' % (tag_app, lib_app))
          else:
            self.remove_from_svn()
            return c.error('Failed to commit to SVN - aborting')
        else:
          self.remove_from_svn()
          return c.error('There was an error updating the lib dependency of %s' % tag_app)



    #if not no_static:
    r = ActionStatic(c)(app=tag_app)
    if not r:
      tag_app.remove_from_svn()
      return c.error('Failed to create static files for %s - tag removed from SVN.' % tag_app)

    c.log('Created %s' % tag_app, color=c.BLUE)

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
      print "Last Version: no version created"
      return True

    lib_app = None
    if last_version and not app.is_lib():
        lib_app = AppFactory(c)(app.app_key, version=last_version).lib_dependency()

    if lib_app:
      last_version_str = "%s (%s)" % (last_version, lib_app)
    else:
      last_version_str = "%s" % last_version

    print "Last Version:\t\t%s" % last_version_str

    versioned_app = AppFactory(c)(app.app_key, version=last_version)
    last_tag = versioned_app.last_tag()

    if last_tag and not app.is_lib():
      lib_app = AppFactory(c)(versioned_app.app_key, last_version, last_tag).lib_dependency()

    if lib_app:
      last_tag_str = "%s (%s)" % (last_tag, lib_app)
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
    pass


def main():

  t1 = datetime.datetime.now()

  # OPTION PARSING

  valid_actions = [
      ('setup_acre', 'create a local acre instance', ActionSetupAcre),
      ('setup_site', 'create a local site instance', ActionSetupSite),
      ('link', '\tDEPRECATED: connect acre and site so that acre will read site trunk apps from the filesystem', ActionLink),
      ('setup', '\tsetup acre and freebase-site and link them', ActionSetup),
      ('deploy_acre', 'deploy an acre instance to production app-engine', ActionDeployAcre),
      ('setup_dns', 'setup freebase site dns for your host', ActionSetupSimpleDNS),
      ('setup_wildcard_dns', 'setup wildcard dns for your host - Mac OS X only', ActionSetupWildcardDNS),
      ('info', 'provide information on all apps or a specific app', ActionInfo),
      ('create_branch', 'creates a branch of your app', ActionCreateAppBranch),
      ('create_tag', 'creates a tag of your app', ActionCreateAppTag),
      ('create_static', 'creates a static bundle and writes it to the provided tag', ActionStatic),

      ('test', '\ttest', ActionTest)
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
  parser.add_option('', '--everything', dest='everything', action='store_true',
                    default=False, help='checkout branches and tags when setting up a freebase site')
  parser.add_option('', '--acre_dir', dest='acre_dir',
                    default=None, help='the local acre directory')
  parser.add_option('', '--acre_host', dest='acre_host',
                    default='z', help='the hostname that you will use to address this acre installation')
  parser.add_option('', '--site_dir', dest='site_dir',
                    default=None, help='the local site directory')
  parser.add_option('', '--acre_port', dest='acre_port',
                    default=8115, help='the port you want to serve acre from')
  parser.add_option('-c', '--acre_config', dest='acre_config',
                    help='acre configuration target - e.g. acre-sandbox-freebasesite or devel')
  parser.add_option('-v', '--version', dest='version', default=None,
                    help='a version of the app - e.g. 12 - use "latest" to auto-detect the last version branched')
  parser.add_option('-t', '--tag', dest='tag', default=None,
                    help='a tag of the app - e.g. 12b')
  parser.add_option('-a', '--app', dest='app', default=None,
                    help='an app id - e.g. /user/namesbc/mysuperapp or an app key under /freebase/site - e.g. homepage')
  parser.add_option('-l', '--lib', dest='lib', default=None,
                    help='the version of lib you want to tie this app branch to - use "latest" to tie to last branched version')
  parser.add_option('', '--failover', dest='failover', action='store_true',
                    default=False, help='will also deploy acre to the failover version of appengine')
  parser.add_option('', '--nosite', dest='nosite', action='store_true',
                    default=False, help='will not bundle freebase site with acre when deploying to appengine')

  (options, args) = parser.parse_args()


  context = Context(options)  

  #there was no action specified
  if not len(args) or args[0] not in [a[0] for a in valid_actions]:
    parser.error('You did not provide a valid action')
    exit(-1)
  
  if options.app and ((options.version and options.version == 'latest') or (options.lib and options.lib == 'latest')):
    if options.lib:
      app = AppFactory(context)('lib')
    else:
      app = AppFactory(context)(options.app)

    last_version = app.last_svn_version()
    if last_version:
      if options.version:
        options.version = last_version
      else:
        options.lib = last_version

    context.set_app(AppFactory(context)(options.app, options.version))


  for action in args:
    for valid_action in valid_actions:
      if action == valid_action[0]:

        context.set_action(action)

        try:
          result = valid_action[2](context)()
        finally:
          GetAcre(context).stop()

        context.set_action(action)

        t2 = datetime.datetime.now()
        if not result:
          context.error('FAILED: action %s failed (%s)' % (action, context.duration_human(t2-t1)))
        else:
          context.log('SUCCESS: action %s ended succesfully (%s)' % (action, context.duration_human(t2-t1)), color=context.GREEN)

    for reminder in context.reminders:
        context.log(reminder, 'reminder', color=context.RED)

if __name__ == '__main__':
    main()
