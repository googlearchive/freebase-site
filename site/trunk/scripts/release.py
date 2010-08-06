#!/usr/bin/env python
from optparse import OptionParser
from freebase.api import HTTPMetawebSession, MetawebError
import urllib2
ALL_APPS = ['apps', 'core', 'devdocs', 'domain', 'error', 'flot', 'homepage', 'jquerytools', 'jqueryui', 'policies', 'promise', 'queries', 'routing', 'schema', 'template', 'toolbox', 'permission', 'appadmin']


GRAPH = {
    "otg":"http://acre.freebase.com",
    "sandbox":"http://acre.sandbox-freebase.com",
    "qa":"http://acre.branch.qa.metaweb.com",
    "local" : "http://ae.branch.qa.metaweb.com:8115"
}

def get_credentials(self, user=None):
    
    try:
        if not user:
            user = raw_input("Username: ")
            
        import getpass
        pw = getpass.getpass()
    except KeyboardInterrupt:
        print "\nPush aborted."
        return (None, None)

    return (user, pw)

def is_number(str):
    '''
    is str a number? (1, 2.1, etc.)
    '''
    try:
        float(str)
        return True
    except ValueError, e:
        return False

#
# command line options parser
#
# usage: branch.py -p branch app1:app1_version:deploy1_version app2:app2_version:deploy2_version
#
# -g <graph>
cmd_options = OptionParser()
cmd_options.add_option('-g', '--graph', dest='graph', 
                       help="acre host i.e., otg|sandbox|qa")
cmd_options.add_option('-u', '--user', dest='user', 
                       help="freebase username - e.g. namesbc")
options, args = cmd_options.parse_args()

# graph, freebaseapps default to branch
graph = GRAPH.get(options.graph, GRAPH['qa'])

u = urllib2.urlopen(graph+'/acre/status').read()
me_server = u.split('\n')[2].split(':')[1].strip()

fb = HTTPMetawebSession(me_server, acre_service_url=graph)

(user, pw) = get_credentials(options.user)
if not (user and pw):
    print "error - no credentials given"
    exit(-1)
fb.login(user, pw)


if len(args) and args[0].startswith('all:'):
    _, version = args[0].split(":")

    args = ["%s:%s" % (app, version) for app in ALL_APPS]


for arg in args:

    try :
        app, version = arg.split(":", 1)
    except ValueError, e:
        print 'You must specify an app version for {arg} [app:version]'.format(arg=arg)
        sys.exit()
    
    appid = '/freebase/site/{app}'.format(app=app)

    if not is_number(version):
        print 'Version {version} for app {app} must be a number'.format(version=version, app=app)
        sys.exit()

    print "setting release of app %s to version %s" % (app, version)
    fb.set_app_release(appid, version)
