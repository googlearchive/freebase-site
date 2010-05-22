#!/usr/bin/env python
import os
from optparse import OptionParser
import urllib
import urllib2
import json
import subprocess
import dir
from tempfile import mkdtemp

POD = {
    "otg":"http://acre.freebase.com",
    "sandbox":"http://acre.sandbox-freebase.com",
    "branch":"http://acre.branch.qa.metaweb.com",
    "trunk":"http://acre.trunk.qa.metaweb.com"
}

FREEBASEAPPS = {
    "otg": "dev.freebaseapps.com",
    "sandbox": "dev.sandbox-freebaseapps.com",
    "branch": "dev.branch.qa-freebaseapps.com",
    "trunk": "dev.trunk.qa-freebaseapps.com"
}

EXTENSIONS = [".js", ".css", ".png", ".gif", ".jpg", ".txt"]

cmd_options = OptionParser()
cmd_options.add_option('-p', '--pod', dest='pod', 
                       help="acre host i.e., otg|sandbox|branch|trunk")

options, args = cmd_options.parse_args()

pod = POD.get(options.pod, POD['branch'])
freebaseapps = FREEBASEAPPS.get(options.pod, FREEBASEAPPS['branch'])

print "branching to %s" % pod

def get_json(url):
    body = ''.join(urllib2.urlopen(url).readlines())
    return json.loads(body)

def is_int(str):
    try:
        int(str)
        return True
    except ValueError, e:
        return False

def next_version(appid):
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

apps = []
for arg in args:    
    appname, ver = arg.split(":", 1) if ":" in arg else (arg, None)
    appid = "/freebase/site/%s" % appname
    if not ver:
        ver = next_version(appid)            
    apps.append((appname, appid, str(ver), os.path.join(dir.trunk, appname)))


# copy to /dev (svn branch)
# mdkir -p /dev/sample/3
#              /scripts/3
#              /core/3
"""
for appname, appid, ver, appdir in apps:
    src = 'https://svn.metaweb.com/svn/freebase_site/trunk/%s' % appname
    dest = 'https://svn.metaweb.com/svn/freebase_site/dev/%s/%s' % (appname, ver)
    msg = "Creating branch %s for %s" % (ver, appname)
    cmd = ['svn', 'copy', src, dest, "--parents", "-m", '"%s"' % msg]
    print " ".join(cmd)
    subprocess.call(cmd)

         
# push to acre
for appname, appid, ver, appdir in apps:
    cmd = [os.path.join(dir.scripts, 'acrepush.py'),
           '-i', appid,
           '-h', pod,
           appdir, ver]
    print " ".join(cmd)
    subprocess.call(cmd)
"""

# copy to /deloy (for static server - freebaselibs.com)
for appname, appid, ver, appdir in apps:
    dest = 'https://svn.metaweb.com/svn/freebase_site/deploy/%s/%s' % (appname, ver)

    # 1. create deploy dir in svn
    msg = "Create deploy directory for %s:%s" % (appname, ver)
    cmd = ['svn', 'mkdir', dest, "--parents", "-m", '"%s"' % msg]
    print " ".join(cmd)    
    subprocess.call(cmd)

    # 2. checkout deploy dir into temp directory
    tempdir = mkdtemp()
    cmd = ['svn', 'checkout', dest, tempdir]
    print " ".join(cmd)      
    subprocess.call(cmd)    

    # 3. urlfetch static files from app url
    base_url = "http://{ver}.{appname}.site.freebase.{freebaseapps}".format(ver=ver, appname=appname, freebaseapps=freebaseapps)
    cmd = [os.path.join(dir.scripts, 'deploy.py'),
           "-s", base_url,
           "-d", tempdir]
    print " ".join(cmd)
    subprocess.call(cmd)    

    # 4. svn add
    cwd = os.getcwd()
    os.chdir(tempdir)
    files = [f for f in os.listdir(tempdir) if os.path.splitext(f)[1].lower() in EXTENSIONS]
    cmd = ['svn', 'add'] + files
    print " ".join(cmd)
    subprocess.call(cmd)
    os.chdir(cwd)

    # 5. svn commit
    msg = "Uploading static files to freebaselibs deploy directory from %s" % base_url
    cmd = ['svn', 'commit', tempdir, "-m", '"%s"' % msg]
    print " ".join(cmd)    
    subprocess.call(cmd)

# update MANIFEST freebaselibs prefix
