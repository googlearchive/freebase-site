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
import hashlib

ALL_APPS = ['apps', 'core', 'devdocs', 'domain', 'error', 'flot', 'homepage', 'jquerytools', 'jqueryui', 'permission', 'policies', 'promise', 'queries', 'routing', 'schema', 'template', 'toolbox', 'validator', 'appadmin']

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
EXTENSIONS = [".js", ".css", ".less", ".txt"] + IMG_EXTENSIONS

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

    tries = 3

    while tries > 0:
        try:
            contents = urllib2.urlopen(request).readlines()
        except:
            print 'ERROR FETCHING URL: %s' % url
            if tries > 1:
                print 'trying again....'
            else:
                raise

        tries -= 1

    if isjson:
        return json.loads(''.join(contents))
    
    return contents

def deploy_static_files(source_dir, source_url, dest_dir, **kws):
    # load app MANIFEST.MF
    url = "%s/MANIFEST" % source_url    
    mf = fetch_url(url, isjson=True)
    if not (mf and mf.get('result')):
        raise "Aborting push of resource files - no manifest found!"
    mf = mf['result']
    for manifest in ['javascript', 'stylesheet']:
        get_manifest_files(mf[manifest], source_url, dest_dir, **kws)

    # 2. svn list version and copy images (*.png, *.gif, etc.) to dest_dir
    img_files = [f for f in os.listdir(source_dir) if os.path.splitext(f)[1].lower() in IMG_EXTENSIONS]    
    for f in img_files:
        src = os.path.join(source_dir, f)
        # in local acre dev, we use double extensions for static files including image files
        # convert double extensions to single extension
        dest = os.path.join(dest_dir, os.path.splitext(f)[0])
        shutil.copy2(src, dest)

    # 3. if static files, import to svn deployed dir
    files = sorted([f for f in os.listdir(dest_dir) if os.path.splitext(f)[1].lower() in EXTENSIONS])
    return files

def get_manifest_files(manifest, source_url, dest_dir, **kws):
    for filename in manifest:
        url = "%s/MANIFEST/%s" % (source_url, filename)
        if kws:
            url = "%s?%s" % (url, urllib.urlencode(kws))
        filename = os.path.join(dest_dir, filename)
        with open(filename, 'w') as dest_file:
            for line in fetch_url(url):
                dest_file.write(line)


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

def hash_for_file(f, block_size=2**20):
    md5 = hashlib.md5()
    while True:
        data = f.read(block_size)
        if not data:
            break
        md5.update(data)
    return md5.hexdigest()







######## READ args ##########







# for each app name specified, determine
# 1. app id (required)
# 2. app version (required) - acre
apps = []
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









################ BRANCH APP ###################







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












############# ACRE PUSH ################




svn_temp_dirs = {}
svn_deploy_revs = {}
         
# get user credentials for pushing to acre
user, pw = get_credentials()

# push app branch to acre
for app, appid, version in apps:
    branch = svn_dev_url(app, version)
    tempdir = mkdtemp() 
    # keep track of all svn checkouts to temporary directories
    svn_temp_dirs[branch] = tempdir
    cmd = ['svn', 'checkout', branch, tempdir]
    run_cmd(cmd)
                    
    # acre push branch
    acrepush.push(appid, graph, tempdir, version=version, user=user, pw=pw)








##########    DEPLOY       ############










# determine if we need to create a new deploy revision by
# 1. determine the md5 hash of all the img files + javascript/stylesheet manifests sorted and concatenated together.
for app, appid, version in apps:
    branch_url = svn_dev_url(app, version)
    branch_dir = svn_temp_dirs[branch_url]

    # 1. urlfetch static files from app url (*.mf.js/*.mf.css)
    deployed_dir = mkdtemp()    
    url = app_url(app, version)
    # We need to pass use_acre_url=1, for the MANIFEST css_preprocessor to return consistent urls for css url declarations to
    # calculate deterministic hashes of all static files for an app.
    # 1. url(local.png) = http://2.localapp.site.freebase.dev.../local.png
    #                  != http://freebaselibs.com/static/freebase_site/localapp/abcdef.../local.png
    # 2. url(externalapp, external.png) = http://3.externalapp.site.freebase.dev.../external.png
    #                                  != http://freebaselibs.com/static/freebase_site/externalapp/abcdef.../external.png
    # This is needed since we have not yet set the MANIFEST static_base_url/image_base_url.
    # The static_base_url/image_base_url is determined by the md5 hash of all static files of an app
    # including the dynamically generated javascript/stylesheet MANIFEST files declared in MF.javascript and MF.stylesheet.
    # The MF.javascript files are deterministic since we go through the external apps MANIFEST/ entry point (i.e., .../MANIFEST/foo.mf.js).
    # The MF.stylesheet files also go through the external apps MANIFEST/ entry point (i.e., .../MANIFEST.foo.mf.css) but is
    # only deterministic if we DO NOT preprocess the css url(...) declarations since it uses the image_base_url.
    static_files = deploy_static_files(branch_dir, url, deployed_dir, use_acre_url=1)
    if not static_files:
        continue

    # deploy_rev is the md5 hash of all the static files sorted and concatenated together
    status, path = mkstemp()
    with open(path, "wb") as hash_file:
        print("hash_file: %s" % path)
        for f in static_files:
            with open(os.path.join(deployed_dir, f), "rb") as static_file:
                print("static_file: %s" % os.path.join(deployed_dir, f))
                while True:
                    data = static_file.read(2**20)
                    if not data:
                        break
                    hash_file.write(data)   
    with open(path, "rb") as hash_file:
        deploy_rev = hash_for_file(hash_file)
        svn_deploy_revs[branch_url] = deploy_rev

    # update MANIFEST static_base_url
    base_url = "http://freebaselibs.com/static/freebase_site/{app}/{rev}".format(app=app, rev=deploy_rev)
    cfg = json.dumps({
        "static_base_url": base_url,
        "image_base_url": base_url
    })
    manifest = os.path.join(branch_dir, "MANIFEST.sjs")
    if os.path.exists(manifest):
        init_re = re.compile(r'\.init\s*\(\s*MF\s*\,\s*this.*$')
        temp = mkstemp()
        with open(temp[1], "w") as tmp:
            with open(os.path.join(manifest)) as mf:
                for line in mf.xreadlines():
                    tmp.write(init_re.sub('.init(MF, this, %s);' % cfg, line))
        shutil.copy2(temp[1], manifest)
        
        msg = 'Update MANIFEST static_base_url'
        svn_commit(branch_dir, msg)    

        # acre push branch
        acrepush.push(appid, graph, branch_dir, version=version, user=user, pw=pw)

        #mf_url = app_url(app, version) + "/MANIFEST"
        #print ">>>>>>>>>> fetch_url {url}".format(url=mf_url)
        #print json.dumps(fetch_url(mf_url, isjson=True), indent=2)
        
        
# flag to tell us if we've created new freebaselibs deployed directory,
# and if so, restart the outbound01/02 static servers
restart_static_servers = False

for app, appid, version in apps:
    branch_url = svn_dev_url(app, version)
    branch_dir = svn_temp_dirs[branch_url]
    deploy_rev = svn_deploy_revs.get(branch_url)

    if not deploy_rev:
        continue
    
    # check if a deployed_rev already exists or not
    deployed_url = svn_deployed_url(app, deploy_rev)
    cmd = ['svn', 'ls', deployed_url]
    r = run_cmd(cmd, exit=False)

    if r != -1:
        continue

    # deployed_rev does not exist, add it to svn    
    deployed_dir = mkdtemp()
    url = app_url(app, version)
    # now that we have deterministically calculated the deployed_rev and updated the MANIFEST static_base_url/image_base_url,
    # we now want to reget the static_files with the correct css url(...) pointing the http://freebaselibs...
    static_files = deploy_static_files(branch_dir, url, deployed_dir)
            
    # css min
    css_files = [f for f in os.listdir(deployed_dir) if os.path.splitext(f)[1].lower() == ".css"]
    for css_file in css_files:
        css_path = os.path.join(deployed_dir, css_file)
        
        # we should not have any css url declrations that look like 'url(http://3.template.site.freebase.dev...)'
        cmd = ['grep', '-E', 'url\s*\(\s*https?\:\/\/[0-9]+\.', css_path]
        r = run_cmd(cmd)
        if r:
            prompt = '{f} contains 1 or more acre url declrarations. Continue with deploying {rev} of {app} [y/n]?'.format(f=f, rev=deploy_rev, app=app)
            if raw_input(prompt).lower() != 'y':
                sys.exit()
        
        with open(css_path, "r") as infile:
            min_css = cssmin(infile.read())
        with open(css_path, "w") as outfile:
            outfile.write(min_css)

    # js min (closure compiler)
    js_files = [f for f in os.listdir(deployed_dir) if os.path.splitext(f)[1].lower() == ".js"]
    for js_file in js_files:
        js_path = os.path.join(deployed_dir, js_file)
        status, temppath = mkstemp()        
        with open(temppath, "w") as tempfile:
            cmd = [JAVA] + JAVA_OPTS + ["--js", js_path]
            subprocess.call(cmd, stdout=tempfile)
        shutil.copy2(temppath, js_path)
        
    msg = 'Create static file deployed directory version {version} for app {app}'.format(version=deploy_rev, app=app)
    cmd = ['svn', 'import', deployed_dir, deployed_url, '-m', '"%s"' % msg]
    run_cmd(cmd)
    
    restart_static_servers = True









##########  ACREPUSH TRUNK ############






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




########### RESTART STATIC SERVERS ############



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
