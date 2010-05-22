#!/usr/bin/env python
import os
from optparse import OptionParser
import urllib
import urllib2
import json
import subprocess
import dir
from tempfile import mkdtemp

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

# recognized extensions for static files
EXTENSIONS = [".js", ".css", ".png", ".gif", ".jpg", ".txt"]

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

def next_version(appid):
    '''
    determine the next available version number for an app
    1. use pod/appeditor/get_app service to list current versions
    2. increment the highest version
    3. if no versions, return "1"
    '''
    try:
        url = "%s/appeditor/get_app?%s" % (pod, urllib.urlencode(dict(appid=appid)))
        appinfo = get_json(url).get('result')
        versions = appinfo.get('versions', [])
        versions = [v for v in versions if is_int(v['name'])]
        versions.sort(key=lambda x: int(x['name']))
        if versions:
            return int(versions[-1]['name']) + 1    
    except urllib2.HTTPError, e:
        pass
    return 1

#
# command line options parser
#
# usage: branch.py -p branch app1[:version] app2[:version] ...
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

# for each app name specified, determine
# 1. app id
# 2. version, if not specified, next_version()
apps = []
for arg in args:    
    appname, ver = arg.split(":", 1) if ":" in arg else (arg, None)
    appid = "/freebase/site/%s" % appname
    if not ver:
        ver = next_version(appid)            
    apps.append((appname, appid, str(ver)))


# copy to /dev (svn branch)
for appname, appid, ver in apps:
    src = 'https://svn.metaweb.com/svn/freebase_site/trunk/%s' % appname
    dest = 'https://svn.metaweb.com/svn/freebase_site/dev/%s/%s' % (appname, ver)
    msg = "Creating branch /dev/%s/%s" % (appname, ver)
    cmd = ['svn', 'copy', src, dest, "-q", "--parents", "-m", '"%s"' % msg]
    print "[SVN] %s" % " ".join(cmd)
    subprocess.call(cmd)

         
# push to acre
for appname, appid, ver in apps:
    dest = 'https://svn.metaweb.com/svn/freebase_site/dev/%s/%s' % (appname, ver)
    tempdir = mkdtemp()
    cmd = ['svn', 'checkout', dest, tempdir, "-q"]
    print "[SVN] %s" % " ".join(cmd)      
    subprocess.call(cmd)

    freebaselibs_url = "http://freebaselibs.com/static/freebase_site/{appname}/{ver}".format(appname=appname, ver=ver)
    filename = os.path.join(tempdir, "static_base_url.txt.txt")
    with open(filename, "w") as f:
        f.write(freebaselibs_url)

    cmd = ['svn', 'add', filename, "-q"]
    print "[SVN] %s" % " ".join(cmd)
    subprocess.call(cmd)

    msg = "Updating static_base_url.txt for %s/%s" % (appid, ver)
    cmd = ['svn', 'commit', tempdir, "-q", "-m", '"%s"' % msg]    
    print "[SVN] %s" % " ".join(cmd)
    subprocess.call(cmd)
    
    cmd = [os.path.join(dir.scripts, 'acrepush.py'),
           '-i', appid,
           '-h', pod,
           tempdir, ver]

    print "[ACREPUSH] %s" % " ".join(cmd)
    subprocess.call(cmd)


# copy to /deloy (for static server - freebaselibs.com)
for appname, appid, ver in apps:
    dest = 'https://svn.metaweb.com/svn/freebase_site/deploy/%s/%s' % (appname, ver)

    # 1. create deploy dir in svn
    msg = "Create deploy directory /deploy/%s/%s" % (appname, ver)
    cmd = ['svn', 'mkdir', dest, "--parents", "-q", "-m", '"%s"' % msg]
    print "[SVN] %s" % " ".join(cmd)    
    subprocess.call(cmd)

    # 2. checkout deploy dir into temp directory
    tempdir = mkdtemp()
    cmd = ['svn', 'checkout', dest, tempdir, "-q"]
    print "[SVN] %s" % " ".join(cmd)      
    subprocess.call(cmd)    

    # 3. urlfetch static files from app url
    #base_url = "http://{ver}.{appname}.site.freebase.{freebaseapps}".format(ver=ver, appname=appname, freebaseapps=freebaseapps)
    base_url = "http://{appname}.site.freebase.dev.acre.z:8115".format(appname=appname)

    cmd = [os.path.join(dir.scripts, 'deploy.py'),
           "-s", base_url,
           "-d", tempdir]
    print "[DEPLOY] %s" % " ".join(cmd)
    subprocess.call(cmd)    

    # 4. svn add
    cwd = os.getcwd()
    os.chdir(tempdir)
    files = [f for f in os.listdir(tempdir) if os.path.splitext(f)[1].lower() in EXTENSIONS]
    cmd = ['svn', 'add'] + files
    cmd.append('-q')
    print "[SVN] %s" % " ".join(cmd)
    subprocess.call(cmd)
    os.chdir(cwd)

    # 5. svn commit
    msg = "Uploading static files to freebaselibs deploy directory from %s" % base_url
    cmd = ['svn', 'commit', tempdir, "-q", "-m", '"%s"' % msg]
    print "[SVN] %s" % " ".join(cmd)    
    subprocess.call(cmd)


# TODO restart staticserver (outboun01/02)
