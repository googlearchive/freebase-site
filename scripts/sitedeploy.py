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

import sys, shutil, os, re, pwd, pdb, datetime, time, urllib, urllib2, random, threading, copy
from optparse import OptionParser
from tempfile import NamedTemporaryFile
from siteutil import Context, Acre, Site, App, FatalException

try:
  import json
except ImportError:
  import simplejson as json
except ImportError:
  print "ERROR: One of json or simplejson python packages must be installed for this to work."


#checkout and install acre
class ActionSetupAcre:

  def __init__(self, context):
    self.context = context

  def __call__(self, build=True):
    """Setup acre locally.
    In this scenario we have:
    options.acre_version: the acre version we want to checkout.
    options.acre_dir: the *destination* directory we want to check-out.

    Note that unless we set options.acre_version explicitely, Acre.Get() will not bother checking out
    but will assume that options.acre_dir is the directory where acre is already installed.

    """

    c = self.context

    if not c.options.acre_version:
      c.options.acre_version = "trunk"

    acre = Acre.Get(c)

    # BUILD #
    if build:
      r = acre.build()
      if not r:
        return c.error('Failed to build acre at %s' % c.options.acre_dir)

    c.log('*' * 65)
    c.log('')
    c.log('To run acre, type: cd %s; ./acre appengine-run' % c.options.acre_dir)
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
      raise FatalException("You must specify a directory to install the site in with --site_dir.")

    site = Site.Get(c)

    acre = Acre.Get(c)

    if not acre:
      return c.error("Could not get an acre instance. You can specifiy --acre_dir, or --acre_version with a valid acre branch or trunk")

    success = c.googlecode_login()
    if not success:
      return c.error('You must provide valid google code credentials to complete this operation.')

    self.site_checkout = c.options.acre_dir + '/webapp/WEB-INF/scripts/%s/%s' % (site.conf("repository"), site.conf("id"))

    try:
      os.makedirs(self.site_checkout)
      self.site_checkout += '/svn'
    except:
      return c.error('The directory %s already exists, or unable to create directory.' % self.site_checkout)

    r = site.checkout(self.site_checkout)

    if not r:
      return False

    r = c.symlink(self.site_checkout, site.site_dir)

    config_dir = "%s/appengine-config" % site.site_dir

    r = Acre.Get(c).build(target="devel", config_dir=config_dir)
    if not r:
      return c.error('Failed to build acre under %s' % c.options.acre_dir)

    c.log("*" * 65)
    c.log("")
    c.log("In order to run the site:")
    c.log("\t1. Run the acre server: \n cd %s; ./acre -c devel -d %s appengine-run" % (c.options.acre_dir, config_dir))
    c.log("\t2. Visit http://devel.sandbox-freebase.com:%s" % c.options.acre_port)
    c.log("%s is now installed in %s" % (site.conf("id"), site.site_dir))
    c.log("")
    c.log("*" * 65)

    return True

class ActionStatic:

  def __init__(self, context):
    self.context = context

  def __call__(self, app=None):

    c = self.context

    site = Site.Get(c)

    acre = Acre.Get(c)
    if not acre:
      return c.error("Can't continue without an acre instance.")

    if not (acre.is_running() or (acre.build(target='devel', config_dir= "%s/appengine-config" % site.site_dir) and acre.start())):
      return c.error("There was an error starting acre - cannot generate static files without a running acre instance.")

    c.set_acre(acre)

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
    site = Site.Get(c)
    acre = Acre.Get(c)

    config, app_id, app_version = Site.ResolveConfig(c, c.options.config, c.options.site_dir, c.options.host)

    if not site:
      return c.error("Could not figure out location of site. You can specify --site_dir as an option, or run the script from within a site svn checkout directory structure to figure it out automatically.")

    if not acre:
      return c.error("Could not get an acre instance. You can specifiy --acre_dir, or --acre_version with a valid acre branch or trunk")

    if not config:
      return c.error("You have to specify an acre build target with -c e.g. -c sandbox-freebasesite or a host with --host e.g. --host dev.sandbox-freebase.com")

    (r, result) = acre.build(config, config_dir= "%s/appengine-config" % site.site_dir, war=True)

    if not r:
      return c.error("Acre failed to build, aborting.")

    if not c.options.nosite:
      status = acre.start(war=True)

      if not status:
        return c.error('Could not start new acre war bundle under appengine development server, aborting deployment')

    c.log("\nDeployment Summary " + "*" * 45 + "\n", color=c.BLUE)
    c.log("  Config: %s" % config, color=c.BLUE)
    c.log("  Deployed URL: http://%s" % acre.site_host(True), color=c.BLUE)
    if app_version is None:
      c.log("  AppEngine URL: http://%s.appspot.com/" % app_id, color=c.BLUE)
    else:
      c.log("  AppEngine URL: http://%s.%s.appspot.com/" % (app_version, app_id), color=c.BLUE)
    c.log("  AppEngine Dashboard: https://appengine.google.com/dashboard?&app_id=%s\n" % app_id, color=c.BLUE)
    c.log("*" * 65 + "\n", color=c.BLUE)

    if os.path.isdir(acre.site_dir(war=True) + '/googlecode'):
      shutil.rmtree(acre.site_dir(war=True)+ '/googlecode')

    if not c.options.nosite:
      apps = acre.fs_routed_apps()

      if not len(apps):
        raise FatalException("Something went wrong, there are no apps to bundle with Acre, aborting!")

      for app in apps:
        result = app.copy_to_acre_dir(war=True)
        if not result:
          c.error('Failed to copy %s to app-engine bundle, continuing with other apps...' % app)

      # By default, push the environments app too unless --failover was specified.
      if not c.options.failover:
        acre.bundle_environments()

      c.log('The following apps were bundled:\n')
      for app in sorted(apps):
        c.log('\t%s' % app)


    c.log('\nStarting deployment...', color=c.BLUE)
    if not acre.deploy(target=config):
      return c.error('Deployment failed.')

    if c.options.failover:
      c.log('\nStarting deployment of failover version...', color=c.BLUE)
      r = acre.prepare_failover()

      if not r:
        return c.error('Failed to prepare failover version of acre, aborting.')

      acre.bundle_environments()

      if not acre.deploy(config):
        return c.error('Failover deployment failed.')

    return True

class ActionSetup:

  def __init__(self, context):
    self.context = context

  def get_directory_locations(self):

    c = self.context

    site = Site.Get(self.context)

    acre_dir = "~/acre"
    site_dir = "~/%s" % site.conf("id")

    name = raw_input("Enter the directory where you want to install acre (default: %s):" % acre_dir)
    if not name:
      name = acre_dir

    c.options.acre_dir = os.path.expanduser(name.strip())

    name = raw_input("Enter the directory where you want to install %s (default: %s):" % (site.conf("id"), site_dir))
    if not name:
      name = site_dir

    c.options.site_dir = os.path.expanduser(name.strip())

    site.set_site_dir(c.options.site_dir)


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

    return c.log('Setup has finished successfully.')


class ActionSetupSimpleDNS:


  def __init__(self, context):
    self.context = context

  def __call__(self):
    c = self.context

    domains = set(['www.devel-freebase.com'])

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

    local_domains = ['www.devel-freebase.com, acre.com']

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


class ActionCreateAppBranch():

  def __init__(self, context):
    self.context = context


  def __call__(self):
    c = self.context
    c.set_action("branch")
    if not c.options.app:
      return c.error('You have to specify a valid app to branch')

    from_app = App.Get(c, c.options.app, c.options.version)

    c.log('Starting branching app: "%s"' % from_app.app_key, color=c.BLUE)

    #create the branch
    branch_app = from_app.create_branch(c.options.dependency)

    if not branch_app:
      return c.error('Failed to create branch app - is "%s" a valid app key?' % c.options.app_key)

    #set the app object that is going to be used for here onwards
    #by any other stage
    c.set_app(branch_app)

    return True

#TAG
class ActionCreateAppTag():

  def __init__(self, context):
    # Setting some defaults.
    # By default, create a tag of the latest version of the app.
    if not context.options.version:
      context.options.version = "latest"

    # By default, checkout acre trunk if no specific version (branch) or a local directory is specified.
    if not (context.options.acre_version or context.options.acre_dir):
      context.options.acre_version = "trunk"

    self.context = context

  def __call__(self):
    c = self.context
    c.set_action("create_tag")

    if not (c.options.app and c.options.version):
      return c.error('You have to specify a valid app and version to create a tag out of.')

    site = Site.Get(c)

    if not site:
      return c.error("Could not figure out location of site. You can specify --site_dir as an option, or run the script from within a site svn checkout directory structure to figure it out automatically.")

    acre = Acre.Get(c)

    if not acre:
      return c.error("Could not get an acre instance. You can specifiy --acre_dir, or --acre_version with a valid acre branch or trunk")

    from_branch_app = App.Get(c, c.options.app, c.options.version)
    tag_app = from_branch_app.create_tag()

    #if not no_static:
    r = ActionStatic(c)(app=tag_app)
    if not r:
      tag_app.remove_from_svn()
      return c.error('Failed to create static files for "%s" - tag removed from SVN.' % tag_app)

    c.log('Created "%s"' % tag_app, color=c.BLUE)

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

    last_version = app.last_version()
    dep = {}

    if not last_version:
      print "Last Version: no version created"
      return True

    d_app = None
    if last_version and not app.is_lib():
        d_app = App.Get(c, app.app_key, version=last_version).dependency()

    if d_app:
      last_version_str = "%s (%s)" % (last_version, d_app)
    else:
      last_version_str = "%s" % last_version

    print "Last Version:\t\t%s" % last_version_str

    versioned_app = App.Get(c, app.app_key, version=last_version)
    last_tag = versioned_app.last_tag()

    if last_tag and not app.is_lib():
      d_app = App.Get(c, versioned_app.app_key, last_version, last_tag).dependency()

    if d_app:
      last_tag_str = "%s (%s)" % (last_tag, d_app)
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

    if c.options.app:
      return self.info_app()
    else:
      return self.info_all_apps()

class SpeedTestRun(threading.Thread):

  ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_4) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.68 Safari/534.24,gzip(gfe),gzip(gfe),gzip(gfe)'

  _stop = False

  def __init__(self, runid, response_logger=None, name='-'):

    super(SpeedTestRun, self).__init__(name=name)
    self.response_logger = response_logger
    self.runid = runid
    self.urls = []
    self.responses = []

  def stop(self):
    self._stop = True

  def add_urls(self, urls):
    self.urls.extend(urls)

  def parse_x_metaweb_cost(self, response):

    r = {}

    d = response.info().getheader('x-metaweb-cost')

    if not (d and len(d)):
      return r

    for pair in [x.lstrip() for x in d.split(',')]:
      key, value = pair.split('=')
      r[key] = value

    return r

  def run(self):

    for i, url in enumerate(self.urls):

      if self._stop:
        break

      original_url = url
      url += "?" in url and "&" or "?"
      url += "_r=%s" % self.runid

      code = 0
      length = 0
      diff = 0
      xh = {}

      try:
        start = time.time()
        req = urllib2.Request(url, headers={'User-Agent' : self.ua})
        f = urllib2.urlopen(req, timeout=30.0)
        code = f.getcode()

        try:
          length = len(f.read())
        except:
          length = 0

        xh = self.parse_x_metaweb_cost(f)

      except urllib2.HTTPError as err:
        code = err.code

      except urllib2.URLError as err:
        if self.response_logger:
          self.response_logger(None, self.name, error="%s - is %s a valid url?" % (err.reason,url))

      finally:
        diff = time.time() - start

        d = {
          'url' : original_url,
          'c' : code,
          'd' : diff,
          'l' : length,
          'x' : xh
          }


      self.responses.append(d)
      if self.response_logger:
        self.response_logger(d, "%s-%s" % (self.name, i))

    return self.responses

class ActionSpeedTest:

  _conf = 'speedtest.json'
  _ids_prefix = 'ids_'


  x_labels_groups = {
    'none' : [],
    'main' : ['at', 'auuc', 'auuw', 'auub', 'afuc', 'amrc', 'amrw']
    }

  x_cost_default = 'main'

  x_labels = {
    'at': 'total acre time spent processing the request',
    'afsc': 'number of unique system files required (multiple requires of same file counts as 1)',
    'asuc': 'number of sytem urlfetches (e.g. appfetchers etc..)',
    'asuw': 'cumulative system urlfetch waiting time',
    'asub': 'cumulative time spent blocking on system urlfetches (doing no other work)',
    'afuc': 'number of unique user files required (multiple requires of same file counts as 1)',
    'auuc': 'number of user urlfetches (e.g. mqlreads from apps)',
    'auuw': 'cumulative user urlfetch waiting time',
    'auub': 'cumulative time spent blocking on user urlfetches (doing no other work)',

    'afmc': 'number of attempts to access the classloader memcache (hits & misses)',
    'afmw': 'cumulative classloader memcache wait time',
    'afcc': 'number of files compiled',
    'afcw': 'cumulative time spent compiling files and putting them in the classloader memcache',
    'afxw': 'cumulative time spent executing js files',
    'aidc': 'number of filesystem directory reads',
    'aidw': 'wait time on filesystem directory reads',
    'aifc': 'number of filesystem file content reads',
    'aifw': 'wait time on file content reads',

    'amrc': 'number of memcache read calls (get or getAll)',
    'amrn': 'number of keys (entries) read from memcache. If all the reads where get() amrc = amrn',
    'amrw': 'wait time on memcache reads',
    'amwc': 'number of memecach write calls (put or putAll)',
    'amwn': 'number of keys (entries) written into memcache. If all writes are put() amwc = amwn',
    'amww': 'wait time on memcache writes',

    'akrc': 'number of times we read a key from the keystore',
    'akrw': 'wait time on keystore key read',
    'akwc': 'number of times we wrote a key to the keystore',
    'akww': 'wait time on keystore key write',
    'akrkc': 'number of times we fetched all the key names from the keystore',
    'akrkw': 'wait time while reading all the key names from the keystore',


    'jsonsc': 'number of json.stringify() calls',
    'jsonsw': 'time spent json stringifying',
    'jsonpc': 'number of json.parse() calls',
    'jsonpw': 'time spent json parsing'
    }

  _ae_dashboard = "https://appengine.google.com/logs"
  _ae_logs_params = {
    "app_id" : None,
    "severity_level_override" : 1,
    "severity_level" : 3,
    "filter" : "_r=%s",
    "filter_type" : "regex",
    "limit" : "100",
    "view" : "Search"
    }

  def __init__(self, context):
    self.context = context
    self.urls = []
    self.largest_url_length = 0
    self.runid = str(datetime.datetime.now()).replace(" ","-").replace(":","-")[0:19]

    self.x_labels_groups['all'] = self.x_labels.keys()

    try:
      fd = open(self._conf)
    except:
      return context.error('Failed to open %s.' % self._conf)

    try:
      self.conf = json.loads(fd.read())
    except Exception as err:
      context.error('There was an error while json parsing the file %s.' % self._conf)
      print err
      raise
    finally:
      fd.close()

    if not context.options.cost in self.x_labels_groups.keys():
      context.error('There is no cost group %s. Available cost groups are:\n %s' % (context.options.cost, '\n'.join(self.x_labels_groups.keys())))
      context.options.cost = self.x_cost_default

    self._labels = self.x_labels_groups.get(context.options.cost)
    self.appengine_logs_url = self.appengine_logs_url()


  def appengine_logs_url(self):
    c = self.context

    if not c.options.host:
      return ""

    site_config, appengine_app_id, appengine_app_version = None, None, None

    try:
      site_config, appengine_app_id, appengine_app_version = Site.ResolveConfig(c, c.options.config, c.options.site_dir, c.options.host)
    except:
      #We really don't care if we found a config, speedtests can be run on arbitrary hosts.
      pass

    if not appengine_app_id:
      return None

    self._ae_logs_params["app_id"] = appengine_app_id
    self._ae_logs_params["filter"] = self._ae_logs_params["filter"] % self.runid

    return "%s?%s" % (self._ae_dashboard, urllib.urlencode(self._ae_logs_params))

  def print_csv(self, responses):

    csv_file = NamedTemporaryFile(delete=False)
    csv_file.write(','.join(['http','time','size','url'] + self._labels) + '\n')

    for r in responses:
      u =  r['url'].replace('http://%s'%self.context.options.host, '')
      csv_file.write(','.join( [str(r['c']),
                                str(r['d'])[:4],
                                str(r['l']), u] +
                               [str(r['x'].get(k, 0)) for k in self._labels  ])+'\n')
    csv_file.close()
    return csv_file.name

  def print_response(self, r, name=0, error=None):
    if error:
      self.context.error(error)
    else:
      u =  r['url'].replace('http://%s'%self.context.options.host, '')
      print '%s\t%s\t%.2f\t%s\t%s%s\t%s' % (name, r['c'], r['d'], r['l'], u, ' ' * (self.largest_url_length-len(u)), '\t'.join([r['x'].get(k, '0') for k in self._labels  ]))

  def generate_urls_for_page(self, page, n):
    """Generate urls given a page specification and numbers to repeat."""
    host = self.context.options.host

    if not host.startswith("http"):
      host = "http://%s" % host

    match = re.search('{(.+)}', page.get('url'))

    #Simple case - non-parmeterized urls.
    if not match:
      return ['{host}{path}'.format(host=host, path=page.get('url')) for x in range(n)]

    #Parameterized urls.

    ids = []
    id_type = match.groups(0)[0]
    try:
      filename = './ids_%s' % id_type
      fd = open(filename)
    except:
      return self.context.error('Could not open file %s where I expected to find %s ids.' % (filename, page.get('type')))
    finally:
      ids = [x.replace('\n','') for x in fd.readlines()]
      fd.close()

    t = len(ids)
    return ['{host}{path}'.format(host=host, path=page.get('url').replace("{%s}" % id_type, ids[x%t])) for x in range(n)]

  def generate_urls_for_test(self, test):
    """Generate urls given a test specification."""

    urls = []
    if not test:
      return urls

    for item in test['pages']:
      if not self.conf['pages'].get(item['page']):
        return self.context.error('Invalid page type %s..' % item['page'])
      urls.extend(self.generate_urls_for_page(self.conf['pages'][item['page']], item.get('repeat') or self.context.options.repeat))

    return urls

  def get_test(self, test_name):
    """Give a test name, will return the test data structure.
    Will resolve parent tests and weights.
    """

    test = self.conf["tests"].get(test_name, None)

    if not test:
      return False

    if test.get("parent"):
      if not test.get("pages"):
        test["pages"] = []

      parent = self.get_test(test["parent"])
      weight = test.get("weight", 1)

      for page in parent["pages"]:
        new_page = copy.copy(page)
        new_page["repeat"] *= weight
        test["pages"].append(new_page)


    return test

  def median(self, l):
    if not (len(l)):
      return 0

    l.sort()

    i = int((len(l)-1)/2)
    return l[i]

  def print_report(self, responses):

    o = self.context.options

    print "\nHost: %s" % o.host
    if len(self.urls):
      print "Sample URL: %s" % self.urls[0]
    if self.appengine_logs_url:
      print "AppEngine Logs: %s" % self.appengine_logs_url
    print "Total Requests: %s" % len(responses)
    print "Total Successful Requests: %s" % len([x for x in responses if x['c'] == 200])
    print "Total Concurrent Clients: %s" % o.concurrent
    r = [x['d'] for x in responses if x['c'] == 200]
    print 'Median Response Time: %.2f seconds' % self.median(r)

    print '\nMedian Values for X-Metaweb-Cost:'
    cost_rows = [["key", "median", "description"]]
    for key in sorted(self._labels):
      r = [x['x'].get(key,0) for x in responses if x['c'] == 200]
      cost_rows.append([key, self.median(r), self.x_labels[key]])
      #print '\t%s - %s: \t%s' % (key, self.x_labels[key], self.median(r))

    self.context.pprint_table(cost_rows)

  def list(self):

    c = self.context

    print "\nPages\n"

    table = [['page','url','type']]
    for key, page in sorted(self.conf['pages'].iteritems()):
      table.append([key, page['url'], page.get('type', '-')])

    c.pprint_table(table)

    print "\nTests\n"

    table = [['test', 'page', 'repeat', 'random']]
    for test_name in sorted(self.conf['tests'].keys()):
      test = self.get_test(test_name)
      pages_rows = []
      pages = test['pages']
      total_requests = pages[0].get("repeat", c.options.repeat)
      if len(pages) > 1:
        for page in pages[1:]:
          total_requests += page.get("repeat", c.options.repeat)
          pages_rows.append(['', page.get('page'), str(page.get('repeat', c.options.repeat)), ''])

      table.append(["%s(%s)" % (test_name, total_requests), pages[0]['page'], str(pages[0].get('repeat', c.options.repeat)), str(test.get('random'))])
      table.extend(pages_rows)

    c.pprint_table(table)

    return True

  def __call__(self):
    """Run the speedtest.

    Start a thread pool == concurrent users and wait until they are done.
    Gather results and print reports.

    """
    c = self.context

    if c.options.list:
      return self.list()

    randomise = False

    # Case 1: Test a single page.

    if c.options.page:

      # If --page starts with a /, then construct a pseudo-page entry
      if c.options.page.startswith("/"):
        path = {"url" : c.options.page }
      # Otherwise read it from the configuration file
      elif self.conf['pages'].get(c.options.page):
        path = self.conf['pages'][c.options.page]
      else:
        raise FatalException("There is no page configuration called %s in speedtest.conf" % c.options.page)

      urls = self.generate_urls_for_page(path, c.options.repeat)

    # Case 2: Run a test bundle of multiple pages
    elif c.options.test:
      if not self.conf['tests'].get(c.options.test):
        return c.error('The test you specified does not exist. Available errors are: \n%s' % '\n'.join(self.conf['tests'].keys()))

      urls = self.generate_urls_for_test(self.get_test(c.options.test))
      randomise = self.conf['tests'][c.options.test].get('random', False)


    self.urls = urls
    # Start a thread pool to simulate concurrent requests.
    threads = []
    for x in range(c.options.concurrent):
      runner = SpeedTestRun(runid=self.runid, response_logger=self.print_response, name=str(len(threads)))
      if randomise:
        random.shuffle(urls)
      runner.add_urls(urls)
      threads.append(runner)

    print "\nStarting %s requests to host %s" % (len(urls) * c.options.concurrent, c.options.host)

    if self.appengine_logs_url:
      print "AppEngine Logs: %s" % self.appengine_logs_url

    self.largest_url_length =  max([len(x.replace("http://%s" % c.options.host, "")) for x in urls])
    print "\njob\thttp\ttime\tsize\turl%s\t%s" % (" " * self.largest_url_length, "\t".join(self._labels))

    interrupted = False

    # Start the threads and wait until they are done.

    for thread in threads:
      thread.start()
      time.sleep(0.2)

    while any([x.is_alive() for x in threads]):

      try:
        time.sleep(0.5)

      # Capture keyboard interrupts (^C) and try to exit gracefully.

      except KeyboardInterrupt as interrupted:
        for thread in threads:
          if not thread._stop:
            thread.stop()
        c.error('Waiting for threads to exit...')

    # Gather all responses.

    responses = []
    for thread in threads:
      responses.extend(thread.responses)

    # Print reports and create CSV and html files.

    self.print_report(responses)

    csv_filename = self.print_csv(responses)
    print 'CSV dump: %s' % csv_filename

    # If the run was interruted by the user, re-raise that here.
    if interrupted:
      raise interrupted

    return True


class ActionGetIds:

  _clauses = {

      "/type/domain" : { "key" : { "namespace" : "/", "limit" : 1 }},
      "/type/type" : { "/type/type/domain" : { "key" : { "namespace" : "/", "limit" : 1 }} }
      }

  _use_ids = ["/type/type", "/type/domain", "/type/user", "/freebase/apps/app", "/type/lang"]

  def __init__(self, context):

    self.context = context

  def __call__(self):
    """Get a list of ids from the graph for a given type."""

    c = self.context

    if not c.options.type:
      return c.error('You have to specify a freebase type to get ids for.')

    query = [{'mid' : None, 'id' : None, 'type' : c.options.type, 'limit' : c.options.repeat }]

    if self._clauses.get(c.options.type, None):
      query[0].update(self._clauses[c.options.type])

    result = c.mqlread(query)

    if not result.get('result'):
      return c.error('mqlread failed: %s' % json.dumps(query))

    id_key = c.options.type in self._use_ids and "id" or "mid"
    for item in result.get('result'):
      print item[id_key]


    return True


class ActionListApps:

  def __init__(self, context):
    self.context = context

  def __call__(self):
    print ",".join(Site.Get(self.context).apps())
    return True


class ActionCreateRoutes:

  def __init__(self, context):
    self.context = context

  def __call__(self):

    site = Site.Get(self.context)

    lib = None
    lib_app = App.Get(self.context, "lib")
    last_tag = lib_app.last_tag()
    if last_tag:
      lib = "//%s.%s.www.tags.svn.freebase-site.googlecode.dev" % (last_tag, "lib")
    else:
      lib = "//lib.www.trunk.svn.freebase-site.googlecode.dev"


    print '''
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = "%s";
var tags_codebase = "%s";

var environment_rules = {

    "labels" : {
        "lib": "%s",
        "default" : "//default.dev",
''' % (site.conf("acre_id_suffix_trunk"), site.conf("acre_id_suffix_tags"), lib)

    apps = site.apps()
    for i,app_key in enumerate(apps):

      if app_key == "lib":
        continue

      app = App.Get(self.context, app_key)
      last_tag = app.last_tag()

      if last_tag:
        print '        "%s": "//%s.%s" + tags_codebase%s' % (app_key, last_tag, app_key, i < len(apps)-1 and "," or "")
      else:
        print '        "%s": "//%s" + codebase%s' % (app_key, app_key, i < len(apps)-1 and "," or "")

    print '''
    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);
'''

    return True



class ActionTest:

  def __init__(self, context):
    self.context = context


  def __call__(self):
    c = self.context

    config, app_id, app_version = Site.ResolveConfig(c, c.options.config, site_dir=c.options.site_dir, host=c.options.host)

    print config
    return True



def main():

  # OPTION PARSING

  valid_actions = [
      ("setup_acre", "create a local acre instance", ActionSetupAcre),
      ("setup_site", "create a local site instance", ActionSetupSite),
      ("setup", "\tsetup acre and freebase-site and link them", ActionSetup),
      ("deploy_acre", "deploy an acre instance to production app-engine", ActionDeployAcre),
      ("setup_dns", "setup freebase site dns for your host", ActionSetupSimpleDNS),
      ("setup_wildcard_dns", "setup wildcard dns for your host - Mac OS X only", ActionSetupWildcardDNS),
      ("info", "provide information on all apps or a specific app", ActionInfo),
      ("create_branch", "creates a branch of your app", ActionCreateAppBranch),
      ("create_tag", "creates a tag of your app", ActionCreateAppTag),
      ("create_static", "creates a static bundle and writes it to the provided tag", ActionStatic),
      ("speedtest", "run a speedtest", ActionSpeedTest),
      ("getids", "get freebase mids for a given type - useful for speedtests", ActionGetIds),
      ("listapps", "get a list of apps for this site", ActionListApps),
      ("create_routes", "create the routes configuration that will point to the last tag of every app", ActionCreateRoutes),
      ("test", "\ttest", ActionTest)
      ]


  usage = """%prog action [options]
\nActions:
"""
  usage += "\n".join(["\t%s\t%s" % a[:2] for a in valid_actions])

  parser = OptionParser(usage=usage)
  parser.add_option("-u", "--user", dest="user",
                    help="google code username - e.g. johnsmith@gmail.com")
  parser.add_option("-p", "--password", dest="password",
                    help="google code password")
  parser.add_option("-b", "--verbose", dest="verbose", action="store_true",
                    default=False, help="verbose mode will print out more debugging output")
  parser.add_option("", "--acre_dir", dest="acre_dir",
                    default=None, help="the local acre directory")
  parser.add_option("", "--acre_version", dest="acre_version",
                    default=None, help="an svn version of acre - either 'trunk' or a branch number like '34'")
  parser.add_option("", "--acre_host", dest="acre_host",
                    default="z", help="the hostname that you will use to address this acre installation")
  parser.add_option("", "--site_dir", dest="site_dir",
                    default=None, help="the local site directory")
  parser.add_option("", "--acre_port", dest="acre_port",
                    default=8115, help="the port you want to serve acre from")
  parser.add_option("-c", "--config", dest="config",
                    help="acre configuration target - e.g. sandbox-freebasesite or devel")
  parser.add_option("-v", "--version", dest="version", default=None,
                    help="a version of the app - e.g. 12 - use 'latest' to auto-detect the last version branched")
  parser.add_option("-t", "--tag", dest="tag", default=None,
                    help="a tag of the app - e.g. 12b")
  parser.add_option("-a", "--app", dest="app", default=None,
                    help="an app id - e.g. /user/namesbc/mysuperapp or an app key under /freebase/site - e.g. homepage")
  parser.add_option("-d", "--dependency", dest="dependency", default="latest",
                    help="the version of the dependency app you want to tie this app branch to - use 'latest' to tie to last branched version")
  parser.add_option("", "--failover", dest="failover", action="store_true",
                    default=False, help="will also deploy acre to the failover version of appengine")
  parser.add_option("", "--nosite", dest="nosite", action="store_true",
                    default=False, help="will not bundle freebase site with acre when deploying to appengine")
  parser.add_option("-s", "--site", dest="site", default="freebase-site",
                    help="the site you want to work on - one of %s" % ",".join(Site._sites.keys()))
  parser.add_option("", "--prevent_overwrite", dest="prevent_overwrite", action="store_true",
                    default=False, help="avoid copying svn checkouts if the directory already exists")


  #speedtest options

  parser.add_option("", "--page", dest="page", default=None, help="speedtest: the page you are testing")
  parser.add_option("", "--test", dest="test", default=None, help="speedtest: the test you want to run")
  parser.add_option("", "--repeat", dest="repeat", default=10, help="speedtest: number of times the page will be hit", type="int")
  parser.add_option("", "--host", dest="host", default=None, help="host to hit - just the domain name")
  parser.add_option("", "--concurrent", dest="concurrent", default=1, help="speedtest: number of concurrent clients", type="int")
  parser.add_option("", "--list", dest="list", action="store_true", default=False, help="speedtest: list pages and tests")
  parser.add_option("", "--type", dest="type", default="/type/type", help="freebase type id")
  parser.add_option("", "--cost", dest="cost", default=ActionSpeedTest.x_cost_default, help="x-metaweb-cost verbosity: %s" %  "\n".join(ActionSpeedTest.x_labels_groups.keys()))


  # Parse the arguments.
  (options, args) = parser.parse_args()


  # Figure out the action - one action per call.

  # There was no action specified here.
  if not len(args) or args[0] not in [a[0] for a in valid_actions]:
    parser.error('You did not provide a valid action')
    exit(-1)

  action = args[0]
  context = Context(options)
  context.set_action(action)

  for valid_action in valid_actions:
    if action == valid_action[0]:
      action_class = valid_action[2]

  def run(action_class, context):
    """Run an action given the context."""
    context.start_time = datetime.datetime.now()
    result = None

    try:
      result = action_class(context)()

    finally:
      t2 = datetime.datetime.now()

      if not result:
        context.error('FAILED: action %s failed (%s)' % (action, context.duration_human(t2-context.start_time)))
      else:
        context.log('SUCCESS: action %s ended succesfully (%s)' % (action, context.duration_human(t2-context.start_time)), color=context.GREEN)


      context.set_action(action)

    return True

  result = None
  results = []
  context.start_time = datetime.datetime.now()
  # Loop through each app, resolve version/lib from arguments and run the action with that app.

  try:
    if options.app:
      apps = options.app.split(',')
      if apps[0] == "all":
        apps = Site.Get(context).apps()

      for i, app in enumerate(apps):
        options.app = app
        context.set_app(App.Get(context, app, options.version, options.tag))
        result = run(action_class, context)
        results.append(result)

    else:
      result = run(action_class, context)
      results.append(result)

  except KeyboardInterrupt:
    context.error("Aborted by user.")
  except FatalException as ex:
    context.error(ex.msg)
  finally:
    t2 = datetime.datetime.now()
    acre = Acre.Get(context, existing=True)
    if acre:
      acre.stop()

  if not result or False in results:
    n = len([x for x in results if not x])
    context.error('FAILED: action %s failed (%s)' % (action, context.duration_human(t2-context.start_time)))
    if n > 1:
      context.error('%s action%s failed.' % (n,n > 1 and 's' or ''))

  for reminder in context.reminders:
    context.log(reminder, 'reminder', color=context.RED)

if __name__ == '__main__':
    main()
