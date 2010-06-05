#!/usr/bin/env python
import os, sys
from optparse import OptionParser
import urllib
import urllib2
import json
import subprocess
import dir
from tempfile import mkdtemp
import shutil
import re
import acrepush

# acre pod mapping to host for appeditor web services, i.e., /appeditor/get_app
POD = {
    "otg":"http://acre.freebase.com",
    "sandbox":"http://acre.sandbox-freebase.com",
    "branch":"http://acre.branch.qa.metaweb.com",
    "trunk":"http://acre.trunk.qa.metaweb.com"
}

# acre pod mappings to app url suffix, i.e., http:// + ver + id + suffix = app url
FREEBASEAPPS = {
    "otg": "dev.freebaseapps.com",
    "sandbox": "dev.sandbox-freebaseapps.com",
    "branch": "dev.branch.qa-freebaseapps.com",
    "trunk": "dev.trunk.qa-freebaseapps.com"
}

OUTBOUND = ["outbound01.ops.sjc1.metaweb.com", "outbound02.ops.sjc1.metaweb.com"]

# recognized extensions for static files
IMG_EXTENSIONS = [".png", ".gif", ".jpg"]
EXTENSIONS = [".js", ".css", ".txt"] + IMG_EXTENSIONS


#
# command line options parser
#
# usage: branch.py -p branch app1:app1_version:deploy1_version app2:app2_version:deploy2_version
#
# -p <pod>
cmd_options = OptionParser()
cmd_options.add_option('-p', '--pod', dest='pod', 
                       help="acre host i.e., otg|sandbox|branch|trunk")
options, args = cmd_options.parse_args()

# pod, freebaseapps default to branch
pod = POD.get(options.pod, POD['branch'])
freebaseapps = FREEBASEAPPS.get(options.pod, FREEBASEAPPS['branch'])

print '[INFO] branching to {pod}'.format(pod=pod)

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


def get_json(url):
    '''
    urlfetch json
    '''
    body = ''.join(urllib2.urlopen(url).readlines())
    return json.loads(body)

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

def get_app(appid):
    '''
    get app info using  pod/appeditor/get_app service
    '''
    url = "{pod}/appeditor/get_app?{appid}".format(pod=pod, appid=urllib.urlencode(dict(appid=appid)))
    return get_json(url).get('result')

def next_version(appid):
    '''
    determine the next available version number for an app
    1. use pod/appeditor/get_app service to list current versions
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

def svn_revision(path):
    '''
    Do an svn log to get the latest revison of path
    '''
    cmd = ['svn', 'log', '-l', '1', path]
    svn_output = run_cmd(cmd)
    return int(re.search(r'r([\d]+)', svn_output).group(1))

def svn_commit(path, msg, exit=False):
    '''
    Helper method for svn commit
    '''
    cmd = ['svn', 'commit', path, '-m', '"%s"' % msg]
    return run_cmd(cmd, exit=exit)

def svn_deployed_url(app, svn_revision):
    return 'https://svn.metaweb.com/svn/freebase_site/deployed/{app}/$Rev: {svn_revision} $'.format(app=app, svn_revision=svn_revision)

def svn_dev_url(app, version):
    return 'https://svn.metaweb.com/svn/freebase_site/dev/{app}/{version}'.format(app=app, version=version)

def svn_trunk_url(app):
    return 'https://svn.metaweb.com/svn/freebase_site/trunk/{app}'.format(app=app)

def app_url(app, version):
    return 'http://{version}.{app}.site.freebase.{freebaseapps}'.format(version=version, app=app, freebaseapps=freebaseapps)

def get_credentials():
    import getpass
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
    
    # update app.cfg with static_base_url, image_base_url
    filename = os.path.join(tempdir, "app.cfg.cfg")
    
    if (not os.path.exists(filename)):
        base_url = "http://freebaselibs.com/static/freebase_site/{app}/$Rev$".format(app=app)
        cfg = {
            "static_base_url": base_url,
            "image_base_url": base_url
        } 
        with open(filename, "w") as f:
            f.write(json.dumps(cfg, indent=2))
        # add static_base_url.txt.txt to branch. This will error if one already exists
        cmd = ['svn', 'add', filename]
        run_cmd(cmd, exit=False)
        
        # svn propset svn:keywords "Rev" static_base_url.txt.txt
        cmd = ['svn', 'propset', 'svn:keywords', 'Rev', filename]
        run_cmd(cmd)
        
        msg = 'Add app config with static_base_url'
        svn_commit(tempdir, msg)
    else:
        # compare "svn info branch" and "svn info app.cfg"
        # to check if anything was checked in after app.cfg
        if (svn_revision(tempdir) > svn_revision(filename)):
            # touch app.cfg by adding a space to the end of file
            with open(filename, "a") as f:
                f.write(" ")
            
            msg = 'Update app config with static_base_url'
            svn_commit(tempdir, msg)
    
    svn_branch_revs[branch] = svn_revision(branch)
    
    # acre push branch
    acrepush.push(appid, pod, tempdir, version=version, user=user, pw=pw)


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
    
    # 1. create deployed directory for static files in svn
    msg = 'Create static file deployed directory version {version} for app {app}'.format(version=branch_rev, app=app)
    cmd = ['svn', 'mkdir', deployed, '--parents', '-m', '"%s"' % msg]
    run_cmd(cmd)
    
    # 2. checkout deployed directory into temp directory
    tempdir = mkdtemp()
    cmd = ['svn', 'checkout', deployed, tempdir]
    run_cmd(cmd)
    # keep track of all svn checkouts to temporary directories
    svn_temp_dirs[deployed] = tempdir
    
    # 3. urlfetch static files from app url (js/css)
    url = app_url(app, version)
    #url = 'http://{app}.site.freebase.dev.acre.z:8115'.format(app=app)
    cmd = [os.path.join(dir.scripts, 'deploy.py'),
           '-s', url, '-d', tempdir]
    run_cmd(cmd, name='urlfetch')
    
    # 3b: svn list version and copy images (*.png, *.gif, etc.) to tempdir
    branch_dir = svn_temp_dirs[branch]
    img_files = [f for f in os.listdir(branch_dir) if os.path.splitext(f)[1].lower() in IMG_EXTENSIONS]    
    for f in img_files:
        src = os.path.join(branch_dir, f)
        # in local acre dev, we use double extensions for static files including image files
        # convert double extensions to single extension
        dest = os.path.join(tempdir, os.path.splitext(f)[0])
        shutil.copy2(src, dest)
    
    # 4. svn add
    cwd = os.getcwd()
    os.chdir(tempdir)
    files = [f for f in os.listdir(tempdir) if os.path.splitext(f)[1].lower() in EXTENSIONS]
    if files:
        cmd = ['svn', 'add'] + files
        run_cmd(cmd)
        os.chdir(cwd)
    
        # 5. svn commit
        msg = 'Add static files to deployed directory version {version} of app {app}'.format(version=branch_rev, app=app)
        svn_commit(tempdir, msg)
    
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
    acrepush.push(appid, pod, tempdir, user=user, pw=pw)   


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
