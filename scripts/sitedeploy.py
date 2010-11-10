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


import sys, subprocess, shutil, os, hashlib, urllib, urllib2, tempfile, re, pwd, pdb, time, smtplib, socket, getpass, stat
from optparse import OptionParser

from appdeploy import Context

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

    fh.write('ACRE_PORT=%s\n' % c.options.acre_port)
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
    c.log('And then on your browser: http://%s:%s/acre/status' % (c.options.acre_host, c.options.acre_port))
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

    #svn update site

    svn = SVNLocation(c, local_dir=c.options.site_dir)

    #(r, result) = svn.update()

    #if not r:
    #  c.error('Something went wrong with the update')
    #  return c.error(result)

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

    #make the released version of the routing app to be itself

    source_link = SITE_TRUNK_DIR + '/routing'
    target_link = SITE_TRUNK_DIR + '/routing/release'

    r = c.symlink(source_link, target_link)

    if not r:
      return c.error('There was an error linking the released version of the routing app to its trunk version')


    #link the individual branches of each app to the trunk directory of that app
    #this will result in this structure in the disk in the end:
    #<ACRE_DIR>/webapp/WEB-INF/scripts/freebase/site --> <SITE_DIR>/trunk/site
    #   <SITE_DIR>/trunk/site/<app>/<version> ---> <SITE_DIR>/branches/site/<app>/<version>

    #inject appengine_sdk_dir into acre start file

    if not os.path.isdir(SITE_BRANCH_DIR):
      c.log('Cannot sync site branches because they are not checked out. Syncing of acre and site trunk has completed successfully', color=c.BLUE)
      return True

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

    r = ActionSync(c)()

    if not r:
      return c.error('Sync failed.')

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
    return True
    pass


def update_context(c):
  pass

def main():

  # OPTION PARSING

  valid_actions = [
      ('setup_acre', 'create a local acre instance', ActionSetupAcre),
      ('setup_site', 'create a local site svn checkout', ActionSetupSite),
      ('sync', 'sync a local acre instance with a local site checkout and update the local site', ActionSync),
      ('setup', 'setup acre, site and sync', ActionSetup),
      ('setup_dns', 'setup wildcard dns for your host - Mac OS X only', ActionSetupDNS),
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

  (options, args) = parser.parse_args()

  #there was no action specified
  if not len(args) or args[0] not in [a[0] for a in valid_actions]:
    parser.error('You did not provide a valid action')
    exit(-1)


  context = Context(options)
  update_context(context)
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
