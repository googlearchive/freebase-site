#!/usr/bin/env python
import os, sys
from optparse import OptionParser
import urllib
import urllib2
import json
import subprocess
import dir
from tempfile import mkdtemp, mkstemp
import shutil
import re
import acrepush
from cssmin import cssmin

# acre graph mapping to host for appeditor web services, i.e., /appeditor/get_app
GRAPH = {
    "otg":"http://acre.freebase.com",
    "sandbox":"http://acre.sandbox-freebase.com",
    "qa":"http://acre.branch.qa.metaweb.com",
    "local" : "http://ae.branch.qa.metaweb.com:8115"
}

# acre graph mappings to app url suffix, i.e., http:// + ver + id + suffix = app url
FREEBASEAPPS = {
    "otg": "dev.freebaseapps.com",
    "sandbox": "dev.sandbox-freebaseapps.com",
    "qa": "dev.branch.qa-freebaseapps.com",
    "local" : "dev.acre.z:8115"
}

OUTBOUND = ["outbound01.ops.sjc1.metaweb.com", "outbound02.ops.sjc1.metaweb.com"]

# recognized extensions for static files
IMG_EXTENSIONS = [".png", ".gif", ".jpg"]
EXTENSIONS = [".js", ".css", ".txt"] + IMG_EXTENSIONS

JAVA = os.environ.get("JAVA_EXE", "java")
COMPILER = os.path.join(dir.scripts, "compiler.jar")
JAVA_OPTS = ["-jar", COMPILER, "--warning_level", "QUIET"]

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
freebaseapps = FREEBASEAPPS.get(options.graph, FREEBASEAPPS['qa'])

print '[INFO] branching to {graph}'.format(graph=graph)

def log_cmd(cmd, name=None):
    if not name:
        name = cmd[0]

    print '[{name}] {cmd}'.format(name=name, cmd=(' '.join(cmd)))

def run_cmd(cmd, name=None, exit=True):
    log_cmd(cmd, name=name)
    stdout, stderr = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE).communicate()
    if stderr:
        print stderr
        if exit:
            sys.exit()
        else:
            return -1
    return stdout


def is_int(str):
    '''
    is str an int?
    '''
    try:
        int(str)
        return True
    except ValueError, e:
        return False

def is_number(str):
    '''
    is str a number? (1, 2.1, etc.)
    '''
    try:
        float(str)
        return True
    except ValueError, e:
        return False


def fetch_url(url, isjson=False):

    print '[fetchurl] %s' % url
    request = urllib2.Request(url, headers = {'Cache-control': 'no-cache' })
    try:
        contents = urllib2.urlopen(request).readlines()
    except:
        print 'ERROR FETCHING URL: %s' % url
        raise

    if isjson:
        return json.loads(''.join(contents))
    
    return contents


def deploy_static_files(source_url, tmp_dir):
    # load app MANIFEST.MF
    url = "%s/MANIFEST" % source_url
    
    mf = fetch_url(url, isjson=True)

    if not mf:
        print "Aborting push of resource files - no manifest found!"
        return
        
    mf = mf.get('result');

    # get each stylesheet page, cssmin and copy to outdir
    for page in mf.get('stylesheet'):
        url = "%s/MANIFEST/%s" % (source_url, page)
        css = ''.join(fetch_url(url))
        if not css:
            exit(-1)
        min = cssmin(css)
        filename = os.path.join(tmp_dir, page)
        with open(filename, "w") as f:
            f.write(min)
    
        # get each javascript page, compile (closure compiler) and copy to outdir
    for page in mf.get('javascript'):
        url = "%s/MANIFEST/%s" % (source_url, page)
        
        status, path = mkstemp(text=True)    
        with open(path, 'w') as temp:
            for line in fetch_url(url):
                temp.write(line)
                
        filename = os.path.join(tmp_dir, page)
    
        with open(filename, 'w') as outfile:
            cmd = [JAVA] + JAVA_OPTS + ["--js", path]
            subprocess.call(cmd, stdout=outfile)

        # delete temp file
        os.remove(path)



def get_app(appid):
    '''
    get app info using  graph/appeditor/get_app service
    '''
    url = "{graph}/appeditor/get_app?{appid}".format(graph=graph, appid=urllib.urlencode(dict(appid=appid)))
    return fetch_url(url, isjson=True).get('result')

def next_version(appid):
    '''
    determine the next available version number for an app
    1. use graph/appeditor/get_app service to list current versions
    2. increment the highest version
    3. if no versions, return "1"
    '''
    try:
        app_info = get_app(appid)
        versions = appinfo.get('versions', [])
        versions = [v for v in versions if is_int(v['name'])]
        versions.sort(key=lambda x: int(x['name']))
        if versions:
            return int(versions[-1]['name']) + 1    
    except urllib2.HTTPError, e:
        pass
    return 1

def svn_revision(path, files=None):
    '''
    Do an svn log to get the latest revison of path
    '''
    cmd = ['svn', 'log', '-l', '1', path]
    if files:
        cmd += files
    svn_output = run_cmd(cmd)
    if svn_output:
        return int(re.search(r'r([\d]+)', svn_output).group(1))
    return False

def svn_commit(path, msg, exit=False):
    '''
    Helper method for svn commit
    '''
    cmd = ['svn', 'commit', path, '-m', '"%s"' % msg]
    return run_cmd(cmd, exit=exit)

def svn_deployed_url(app, svn_revision):
    return 'https://svn.metaweb.com/svn/freebase_site/deployed/{app}/{svn_revision}'.format(app=app, svn_revision=svn_revision)

def svn_dev_url(app, version):
    return 'https://svn.metaweb.com/svn/freebase_site/dev/{app}/{version}'.format(app=app, version=version)

def svn_trunk_url(app):
    return 'https://svn.metaweb.com/svn/freebase_site/trunk/{app}'.format(app=app)

def app_url(app, version):
    return 'http://{version}.{app}.site.freebase.{freebaseapps}'.format(version=version, app=app, freebaseapps=freebaseapps)

def get_credentials():
    import getpass
    if options.user:
        user = options.user
    else:
        user = raw_input("Freebase Username: ")
    pw = getpass.getpass("Freebase Password: ")
    return (user, pw)

# for each app name specified, determine
# 1. app id (required)
# 2. app version (required) - acre
apps = []
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
    
    # check app version if already exists (in acre)
    try:
        appinfo = get_app(appid)
        v = [v for v in appinfo.get('versions', []) if v['name'] == version]
        if v:
            prompt = 'An acre version {version} already exists for app {app}. Overwrite [y/n]? '.format(version=version, app=app)
            if raw_input(prompt).lower() != "y":
                sys.exit()
    except urllib2.HTTPError, e:
        pass
    
    print app, appid, version
    
    apps.append((app, appid, version))


# copy /trunk/app to /dev/app/version (svn branch) if /dev/app/version does NOT exist
for app, appid, version in apps:
    branch = svn_dev_url(app, version)
    print branch
    cmd = ['svn', 'ls', branch]
    r = run_cmd(cmd, exit=False)
    
    if r != -1:
        # if already in svn, no op
        continue
    
    trunk = svn_trunk_url(app)
    msg = 'Create branch version {version} of app {app}'.format(version=version, app=app)
    cmd = ['svn', 'copy', trunk, branch, '--parents', '-m', '"%s"' % msg]
    run_cmd(cmd)


svn_temp_dirs = {}
svn_branch_revs = {}
         
# push to acre

user, pw = get_credentials()

for app, appid, version in apps:
    branch = svn_dev_url(app, version)
    tempdir = mkdtemp() 
    # keep track of all svn checkouts to temporary directories
    svn_temp_dirs[branch] = tempdir
    cmd = ['svn', 'checkout', branch, tempdir]
    run_cmd(cmd)

    cmd = ['svn', 'ls', branch]
    files = run_cmd(cmd)
    if files:
        files = files.split("\n")
        static_files = []
        for f in files:
            for ext in EXTENSIONS:
                if f.endswith(ext):
                    static_files.append(f)
        if static_files:
            svn_branch_revs[branch] = svn_revision(branch, files=static_files)

    if not svn_branch_revs.get(branch):
        svn_branch_revs[branch] = svn_revision(branch)

    # update MANIFEST static_base_url
    base_url = "http://freebaselibs.com/static/freebase_site/{app}/{rev}".format(app=app, rev=svn_branch_revs[branch])
    cfg = json.dumps({
        "static_base_url": base_url,
        "image_base_url": base_url
    })
    manifest = os.path.join(tempdir, "MANIFEST.sjs")
    if os.path.exists(manifest):
        init_re = re.compile(r'\.init\s*\(\s*MF\s*\,\s*this.*$')
        temp = mkstemp()
        with open(temp[1], "w") as tmp:
            with open(os.path.join(manifest)) as mf:
                for line in mf.xreadlines():
                    tmp.write(init_re.sub('.init(MF, this, %s);' % cfg, line))
        shutil.copy2(temp[1], manifest)
        
        msg = 'Update MANIFEST static_base_url'
        svn_commit(tempdir, msg)
    
    # acre push branch
    acrepush.push(appid, graph, tempdir, version=version, user=user, pw=pw)


# flag to tell us if we've created new freebaselibs deployed directory,
# and if so, restart the outbound01/02 static servers
restart_static_servers = False

# copy to /deloy (for static server - freebaselibs.com)
for app, appid, version in apps:
    # get svn revision of branch (cached above)
    branch = svn_dev_url(app, version)
    branch_rev = svn_branch_revs[branch]
    
    deployed = svn_deployed_url(app, branch_rev)
    cmd = ['svn', 'ls', deployed]
    r = run_cmd(cmd, exit=False)
    
    if r != -1:
        # static files deploy directory already exist for the branch revision - no op
        continue

    # 1. urlfetch static files from app url (js/css)
    tempdir = mkdtemp()
    # keep track of all svn checkouts to temporary directories
    svn_temp_dirs[deployed] = tempdir
    url = app_url(app, version)
    #url = 'http://{app}.site.freebase.dev.acre.z:8115'.format(app=app)
    deploy_static_files(url, tempdir)
    #cmd = [os.path.join(dir.scripts, 'deploy.py'),
    #       '-s', url, '-d', tempdir]
    #run_cmd(cmd, name='urlfetch')

    # 2. svn list version and copy images (*.png, *.gif, etc.) to tempdir
    branch_dir = svn_temp_dirs[branch]
    img_files = [f for f in os.listdir(branch_dir) if os.path.splitext(f)[1].lower() in IMG_EXTENSIONS]    
    for f in img_files:
        src = os.path.join(branch_dir, f)
        # in local acre dev, we use double extensions for static files including image files
        # convert double extensions to single extension
        dest = os.path.join(tempdir, os.path.splitext(f)[0])
        shutil.copy2(src, dest)    

    # 3. if static files, import to svn deployed dir
    files = [f for f in os.listdir(tempdir)]
    if files:
        msg = 'Create static file deployed directory version {version} for app {app}'.format(version=branch_rev, app=app)
        cmd = ['svn', 'import', tempdir, deployed, '-m', '"%s"' % msg]
        run_cmd(cmd)
        restart_static_servers = True


# repush tip of svn:trunk to acre:trunk
for app, appid, version in apps:
    # svn checkout
    trunk = svn_trunk_url(app)
    tempdir = mkdtemp() 
    # keep track of all svn checkouts to temporary directories
    svn_temp_dirs[trunk] = tempdir
    cmd = ['svn', 'checkout', trunk, tempdir]
    run_cmd(cmd)
    
    # acrepush
    acrepush.push(appid, graph, tempdir, user=user, pw=pw)   


if restart_static_servers:
    prompt = 'Do you wish to restart the static servers {servers} [y/n]? '.format(servers=", ".join(OUTBOUND))
    if raw_input(prompt).lower() != "y":
        print 'Please DO NOT forget to restart the static servers {servers}'.format(servers=", ".join(OUTBOUND))
        sys.exit() 
    
    for outbound in OUTBOUND:
        cmd = ["ssh", outbound, "sudo", "mwdeploy"]
        #log('ssh', cmd)
        subprocess.call(cmd)


print "success!"
