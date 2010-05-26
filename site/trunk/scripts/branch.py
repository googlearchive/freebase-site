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

print "[INFO] branching to %s" % pod


def run_cmd(cmd, exit=True):
    stdout, stderr = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE).communicate()
    if stderr:
        print stderr
        if exit:
            sys.exit()
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
    url = "%s/appeditor/get_app?%s" % (pod, urllib.urlencode(dict(appid=appid)))
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


def svn_deployed_url(appname, version):
    return "https://svn.metaweb.com/svn/freebase_site/deployed/%s/%s" % (appname, version)

def svn_dev_url(appname, version):
    return "https://svn.metaweb.com/svn/freebase_site/dev/%s/%s" % (appname, version)

def svn_trunk_url(appname):
    return "https://svn.metaweb.com/svn/freebase_site/trunk/%s" % appname

def app_url(appname, app_ver):
    return "http://{app_ver}.{appname}.site.freebase.{freebaseapps}".format(app_ver=app_ver, appname=appname, freebaseapps=freebaseapps)


# for each app name specified, determine
# 1. app id (required)
# 2. app version (required) - acre
# 3. deploy version (required) - freebaselibs
apps = []
for arg in args:    
    try :
        appname, app_ver, deployed_ver = arg.split(":", 2)
    except ValueError, e:
        print "You must specify an app and deploy version for %s [app_name:app_version:deploy_version]" % arg
        sys.exit()

    if not is_number(app_ver):
        print "Version %s for app % must be a number" % (app_ver, appname)
        sys.exit()

    if not is_number(deployed_ver):
        print "Version %s for deploy % must be a number" % (deployed_ver, appname)
        sys.exit()

    appid = "/freebase/site/%s" % appname
    
    # check app version if already exists
    try:
        appinfo = get_app(appid)
        version = [v for v in appinfo.get('versions', []) if v['name'] == app_ver]
        if version:
            print "An app version %s already exists for %s. Overwrite [y/n]?" % (app_ver, appname)
            if raw_input().lower() != "y":
                sys.exit()
    except urllib2.HTTPError, e:
        pass
    
    # check dev version if already exists
    cmd = ["svn", "ls", svn_dev_url(appname, app_ver)]
    version = run_cmd(cmd, exit=False)
    if version:
        print "A dev version %s already exists for %s. Overwrite [y/n]?" % (app_ver, appname)
        if raw_input().lower() != "y":
            sys.exit()    
        else:
            msg = "Deleting existing dev version %s for app %s" % (app_ver, appname) 
            cmd = ["svn", "delete", svn_dev_url(appname, app_ver), "-m", msg]
            print "[SVN] %s" % " ".join(cmd)
            run_cmd(cmd)

    # check deploy version if already exists
    cmd = ["svn", "ls", svn_deployed_url(appname, deployed_ver)]

    version = run_cmd(cmd, exit=False)
    if version:
        print "A deployed version %s already exists for %s. Overwrite [y/n]?" % (deployed_ver, appname)
        if raw_input().lower() != "y":
            sys.exit()    
        else:
            msg = "Deleting existing deployed version %s for app %s" % (deployed_ver, appname) 
            cmd = ["svn", "delete", svn_deployed_url(appname, deployed_ver), "-m", msg]
            print "[SVN] %s" % " ".join(cmd)
            run_cmd(cmd)

    apps.append((appname, appid, app_ver, deployed_ver))


# copy to /dev (svn branch)
for appname, appid, app_ver, deployed_ver in apps:
    src = svn_trunk_url(appname)
    dest = svn_dev_url(appname, app_ver)
    msg = "Create branch version %s of %s" % (app_ver, appname)
    cmd = ['svn', 'copy', src, dest, "--parents", "-m", '"%s"' % msg]
    print "[SVN] %s" % " ".join(cmd)
    run_cmd(cmd)


svn_temp_dirs = {}
         
# push to acre
for appname, appid, app_ver, deployed_ver in apps:
    dest = svn_dev_url(appname, app_ver)
    tempdir = mkdtemp()
    cmd = ['svn', 'checkout', dest, tempdir]
    print "[SVN] %s" % " ".join(cmd)      
    run_cmd(cmd)    
    # keep track of all svn checkouts to temporary directories
    svn_temp_dirs[dest] = tempdir

    freebaselibs_url = "http://freebaselibs.com/static/freebase_site/{appname}/{deployed_ver}".format(appname=appname, deployed_ver=deployed_ver)
    filename = os.path.join(tempdir, "static_base_url.txt.txt")
    with open(filename, "w") as f:
        f.write(freebaselibs_url)

    cmd = ['svn', 'add', filename]
    print "[SVN] %s" % " ".join(cmd)
    run_cmd(cmd)

    msg = "Update %s/%s/static_base_url.txt with %s" % (appid, app_ver, freebaselibs_url)
    cmd = ['svn', 'commit', tempdir, "-m", '"%s"' % msg]    
    print "[SVN] %s" % " ".join(cmd)
    run_cmd(cmd)
    
    cmd = [os.path.join(dir.scripts, 'acrepush.py'),
           '-i', appid,
           '-h', pod,
           tempdir, app_ver]

    print "[ACREPUSH] %s" % " ".join(cmd)
    if subprocess.call(cmd) != 0:
        print "[ACREPUSH] FAIL!!!"
        sys.exit()


# copy to /deloy (for static server - freebaselibs.com)
for appname, appid, app_ver, deployed_ver in apps:
    dest = svn_deployed_url(appname, deployed_ver)

    # 1. create deploy dir in svn
    msg = "Create deployed version %s for %s" % (deployed_ver, appname)
    cmd = ['svn', 'mkdir', dest, "--parents", "-m", '"%s"' % msg]
    print "[SVN] %s" % " ".join(cmd)    
    run_cmd(cmd)

    # 2. checkout deploy dir into temp directory
    tempdir = mkdtemp()
    cmd = ['svn', 'checkout', dest, tempdir]
    print "[SVN] %s" % " ".join(cmd)      
    run_cmd(cmd)    
    # keep track of all svn checkouts to temporary directories
    svn_temp_dirs[dest] = tempdir

    # 3. urlfetch static files from app url
    #url = app_url(appname, app_ver)
    url = "http://{appname}.site.freebase.dev.acre.z:8115".format(appname=appname)

    cmd = [os.path.join(dir.scripts, 'deploy.py'),
           "-s", url,
           "-d", tempdir]
    print "[DEPLOY] %s" % " ".join(cmd)
    run_cmd(cmd)    

    # 3b: svn list app_ver and copy images (*.png, *.gif, etc.) to tempdir
    branched_dir = svn_temp_dirs[svn_dev_url(appname, app_ver)]
    img_files = [f for f in os.listdir(branched_dir) if os.path.splitext(f)[1].lower() in IMG_EXTENSIONS]    
    for f in img_files:
        src = os.path.join(branched_dir, f)
        # in local acre dev, we use double extensions for static files including image files
        # convert double extensions to single extension
        dest = os.path.join(tempdir, os.path.splitext(f)[0])
        shutil.copy2(src, dest)

    # 4. svn add
    cwd = os.getcwd()
    os.chdir(tempdir)
    files = [f for f in os.listdir(tempdir) if os.path.splitext(f)[1].lower() in EXTENSIONS]
    cmd = ['svn', 'add'] + files
    print "[SVN] %s" % " ".join(cmd)
    run_cmd(cmd)
    os.chdir(cwd)

    # 5. svn commit
    msg = "Add static files to deployed version %s of %s" % (deployed_ver, appname)
    cmd = ['svn', 'commit', tempdir, "-m", '"%s"' % msg]
    print "[SVN] %s" % " ".join(cmd)    
    run_cmd(cmd)


# TODO restart staticserver (outboun01/02)
print "Do you wish to restart the static servers: %s" % OUTBOUND
if raw_input().lower() != "y":
    print "Please DO NOT forget to restart the static servers: %s" % OUTBOUND
    sys.exit() 

for outbound in OUTBOUND:
    cmd = ["ssh", outbound, "sudo", "mwdeploy"]
    print "[SSH] %s" % " ".join(cmd)
    subprocess.call(cmd)

print "success!"
