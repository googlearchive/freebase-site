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


import dir, sys, subprocess, shutil, os, hashlib, urllib, urllib2, tempfile, re, pwd, pdb, time
from optparse import OptionParser
from tempfile import mkdtemp, mkstemp
from cssmin import cssmin

try:
    import json
except ImportError:
    import simplejson as json

from freebase.api import HTTPMetawebSession, MetawebError
from freebase.api.mqlkey import quotekey, unquotekey




## GLOBAL CONFIGURATION ##

SERVICES = {


    'otg' : { 'acre' : 'http://acre.freebase.com',
              'api' : 'http://api.freebase.com',
              'freebaseapps' : 'dev.freebaseapps.com'
              },
    'sandbox' : { 'acre' : 'http://acre.sandbox-freebase.com',
                  'api' : 'http://api.sandbox-freebase.com',
                  'freebaseapps' : 'dev.sandbox-freebaseapps.com'
                  },
    'qa' : { 'acre' : 'http://acre.branch.qa.metaweb.com',
             'api' : 'http://branch.qa.metaweb.com',
             'freebaseapps' : 'dev.branch.qa-freebaseapps.com'
             },
    'local' : { 'acre' : 'http://ae.sandbox-freebase.com:8115',
                'api' : 'http://api.sandbox-freebase.com',
                'freebaseapps' : 'dev.acre.z.:8115'
                }
}

OUTBOUND = ["outbound01.ops.sjc1.metaweb.com", "outbound02.ops.sjc1.metaweb.com"]

# recognized extensions for static files
IMG_EXTENSIONS = [".png", ".gif", ".jpg"]
EXTENSIONS = [".js", ".css", ".less", ".txt"] + IMG_EXTENSIONS

JAVA = os.environ.get("JAVA_EXE", "java")
COMPILER = os.path.join(dir.scripts, "compiler.jar")
JAVA_OPTS = ["-jar", COMPILER, "--warning_level", "QUIET"]



class Context():

    svn_path_root = '/home/%s/src/freebase_site' % os.getenv('USER')
    svn_url_root = 'https://svn.metaweb.com/svn/freebase_site'
    static_url_root =   'http://freebaselibs.com/static/freebase_site'

    
    def __init__(self, options):
        self.options = options
        self.action = ''

        self.svn_temp_dirs = {}

        if options.graph:
            self.services = SERVICES.get(options.graph)
            self.freebase = HTTPMetawebSession(self.services['api'], acre_service_url=self.services['acre'])
            self.freebase_logged_in = False


    def set_action(self, action):
        self.action = action

    def log(self, msg, subaction=None):
        if subaction:
            print '[%s:%s:%s] %s' % (self.action, self.options.app, subaction, msg)
        else:
            print '[%s:%s] %s' % (self.action, self.options.app, msg)

    def verbose(self, msg, subaction=None):
        if self.options.verbose and msg:
            self.log(msg, subaction=None)


    def run_cmd(self, cmd, name=None, exit=True):
        self.log(' '.join(cmd), subaction=name)

        self.log(' '.join(cmd), 'cmd')
        stdout, stderr = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE).communicate()

        if stderr:
            self.log(stderr, 'stderr')
            return (False, stderr)
        
        return (True, stdout)


    def fetch_url(self,url, isjson=False, tries=3):

        self.log(url, 'fetchurl')
        request = urllib2.Request(url, headers = {'Cache-control': 'no-cache' })

        while tries > 0:
            try:
                contents = urllib2.urlopen(request).readlines()
            except:
                c.log(url, subaction='fetch url error')
                if tries > 1:
                    print c.log('trying again....', subaction='fetch url error')
                else:
                    raise

            tries -= 1

        if isjson:
            return json.loads(''.join(contents))
    
        return contents


    def last_known_branch(self, app, version):
        pass


    def resolve_path(self, path):
        pass

    def read_manifest(self, app, version):
        pass


    def figure_out_dependencies(self, trunk=False):
        pass



    def get_app(self):
        '''
        get app info using  graph/appeditor/get_app service
        '''
        url = "{graph}/appeditor/get_app?{appid}".format(graph=self.options.graph, appid=urllib.urlencode(dict(appid=self.options.appid)))
        return fetch_url(url, isjson=True).get('result')

    def next_version(self, appid):
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

    def svn_commit(self, path, msg, exit=False):
        '''
        Helper method for svn commit
        '''
        cmd = ['svn', 'commit', path, '-m', '"%s"' % msg]
        return self.run_cmd(cmd, exit=exit)

    def svn_deployed_url(self, svn_revision):
        return '{svn_url_root}/deployed/{app}/{svn_revision}'.format(svn_url_root=self.svn_url_root, app=self.options.app, svn_revision=svn_revision)

    def svn_branch_url(self):
        return '{svn_url_root}/dev/{app}/{version}'.format(svn_url_root=self.svn_url_root, app=self.options.app, version=self.options.version)

    def svn_trunk_url(self):
        return '{svn_url_root}/trunk/{app}'.format(svn_url_root=self.svn_url_root, app=self.options.app)

    def svn_deployed_path(self, svn_revision):
        return '{svn_path_root}/deployed/{app}/{svn_revision}'.format(svn_path_root=self.svn_path_root, app=self.options.app, svn_revision=svn_revision)

    def svn_branch_path(self):
        return '{svn_path_root}/dev/{app}/{version}'.format(svn_path_root=self.svn_path_root, app=self.options.app, version=self.options.version)

    def svn_trunk_path(self):
        return '{svn_path_root}/trunk/{app}'.format(svn_path_root=self.svn_path_root, app=self.options.app)

    def static_server_url(self, deploy_rev):
        return "{static_url_root}/{app}/{rev}".format(static_url_root=self.static_url_root, app=self.options.app, rev=deploy_rev)

    def app_url(self):
        return 'http://{version}.{app}.site.freebase.{freebaseapps}'.format(version=self.options.version, app=self.options.app, freebaseapps=self.services['freebaseapps'])


    def freebase_login(self):

        if self.freebase_logged_in:
            return True

        try:
            if not self.options.user:
                user = raw_input("Username: ")
            else:
                user = self.options.user

            import getpass
            pw = getpass.getpass()
        except KeyboardInterrupt:
            print "\nAborted."
            return False

        try:
            self.freebase.login(user, pw)
        except:
            self.log('Could not log in with these credentials', 'error')
            return False

        self.freebase_logged_in = True
        return True
        
    def hash_for_file(self,f, block_size=2**20):
        md5 = hashlib.md5()
        while True:
            data = f.read(block_size)
            if not data:
                break
            md5.update(data)
        return md5.hexdigest()



class ActionPush():

    FILE_TYPES = {
        'png':'image/png',
        'jpg':'image/jpeg',
        'gif':'image/gif',
        'html':'text/html',
        'css':'text/css',
        'js':'text/javascript'
        }


    def __init__(self, context, push_trunk = True):
        self.context = context

    def type_for_extension(self, ext):
        ct = self.FILE_TYPES.get(ext, 'text/plain')
        
        if ct == 'text/plain' and ext == 'sjs':
            return (ct, 'acre_script')
        elif ct == 'text/plain' and ext == 'mql':
            return (ct, 'mqlquery')
        elif ct == 'text/plain' and ext == 'mjt':
            return (ct, 'mjt')
        elif ct == 'text/plain':
            return (ct, 'passthrough')
        elif ct.startswith('image'):
            return (ct, 'binary')
        else:
            return (ct, 'passthrough')


    def metadata(self, directory):

        c = self.context

        mdpath = os.path.join(directory, '.metadata')
        if not os.path.exists(mdpath):
            metadata = {}
        else:
            mdf = file(mdpath)
            metadata = json.load(mdf)
            mdf.close()

        if c.options.appid:
            metadata['id'] = c.options.appid
            f = file(os.path.join(directory, '.metadata'), 'w+')
            json.dump(metadata, f)
            f.close()

        if 'id' not in metadata:
            raise Exception("need to supply an id if .metadata is not present")

        def handle_file(f):
            script = { 'id' : None, 'name' : None, 'acre_handler' : None, 'content_type' : None, 'contents': None, 'extension': None}
            fn, ext = f.rsplit('.', 1)
            script['id'] = metadata['id'] + '/' + quotekey(fn)
            script['extension'] = ext
            script['name'] = quotekey(fn)
            script['unquoted_filename'] = fn
            script['contents'] = file(os.path.join(directory, f))
            script['SHA256'] = hashlib.sha256(script['contents'].read()).hexdigest()
            ct, handler = self.type_for_extension(ext)
            script['acre_handler'] = handler
            script['content_type'] = ct

            return script

        metadata['files'] = {}
        metadata['ignored_files'] = []

        # Skip . .. .xxxx xxx.sh and directories

        for f in os.listdir(directory):
            basename, extension = os.path.splitext(f)

            if extension in ['.sh'] or f.startswith('.') or os.path.isdir(os.path.join(directory, f)) or \
                   f[-1] == '~' or basename[len(basename)-4:] in ['.mql', '.sjs', '.mjt']:
                metadata['ignored_files'].append(f)
                continue

            d = handle_file(f)

            if metadata['files'].get(d['name']):
                print 'WARNING: file %s will override contents of %s' % (f, d['name'])

            metadata['files'][d['name']] = d

        return metadata

    def print_app_diff(self, delete_files, push_files, ignored_files):
        
        for filename in ignored_files:
            print "?\t%s" % filename
        for filename,d in delete_files.iteritems():
            if filename not in push_files.keys():
                print "R\t%s\t(%s)" % (unquotekey(filename), d.get('reason', ''))
                
        for filename,d in push_files.iteritems():
            if filename in delete_files.keys() or d.get('reason', '') == 'changed content':
                print "M\t%s\t(%s)" % (d.get('unquoted_filename'), d.get('reason', ''))
            else:
                print "A\t%s\t(%s)" % (d.get('unquoted_filename'), d.get('reason', ''))
                    

        sys.stdout.flush()

    def get_app_diff(self, graph_app, metadata):
        graph_files, local_files = graph_app['files'], metadata['files']

        #the files we need to delete either because they are not in the local directory
        #or because their content-type or handler has changed
        delete_files = {}
        #the files we need to push because they have changed since the last push
        push_files = {}

        #helper for comparing handlers and content type
        def different_handler_and_content_type(graph_stat, local_stat):
            for check in ['content_type', 'acre_handler']:
                if graph_stat[check] != local_stat[check]:
                    return "%s updated" % check

            return False
            
        #first iterate through the graph files and delete any file that does not exist locally
        for filename in graph_files.keys():
            if not filename in local_files.keys():
                delete_files[filename] = { 'reason' : 'not in local directory' }


        #now iterate through the local files
        for filename, local_stat in local_files.iteritems():

            #if it's a new file, just push it
            if not graph_files.get(filename):
                local_stat['reason'] = 'new file'
                push_files[filename] = local_stat
                continue

            graph_stat = graph_files[filename]

            #if the handler or content type have changed, we need to delete the old file and re-push
            different = different_handler_and_content_type(graph_stat, local_stat)
            if different:
                delete_files[filename] = { 'reason' : different }
                local_stat['reason'] = different
                push_files[filename] = local_stat
                break

            #now check if the file contents have changed
            if graph_stat['SHA256'] != local_stat['SHA256']:
                local_stat['reason'] = 'changed content'
                push_files[filename] = local_stat


        self.print_app_diff(delete_files, push_files, metadata['ignored_files'])

        return (delete_files, push_files)

    def create_app(self, id):

        parts = id.split('/')
        
        if '/'.join(parts[:-1]) == '/freebase/site':
            import create_app
            create_app.create_app(parts[-1], self.fb)
            
        else:
            self.fb.create_app(id)

    def push(self, directory, trunk=False, dry=False):

        c = self.context

        metadata = self.metadata(directory)
        graph_app = None
        create_app = False
        try:
            graph_app = c.freebase.get_app(metadata['id'])
        except MetawebError:
            c.log('app does not exist - use "create" action to create it first', 'error')
            return False

        version_app_exists = False
        if (not trunk) and graph_app.get('versions') and len(graph_app['versions']) and c.options.version in [x['name'] for x in graph_app['versions']]:
            version_app_exists = True

        delete_files, push_files = {}, metadata['files']

        if graph_app:
            (delete_files, push_files) = self.get_app_diff(graph_app, metadata)

        if dry:
            print "Not making any changes (dry run)"
            return


        ###### dry run until this point ##########
        if len(delete_files.keys()) or len(push_files.keys()) or not trunk:
            success = c.freebase_login()
            if not success:
                c.log('cannot push without logging in to freebase', 'error')
                return False

        if not (len(delete_files.keys()) or len(push_files.keys())):
            c.log('no files affected', 'push')

        files_changed = set()

        for filename,val in delete_files.iteritems():
            print ".",
            sys.stdout.flush()
            c.freebase.delete_app_file(c.options.appid, unquotekey(filename))
            files_changed.add(filename)

        for filename, val in push_files.iteritems():
            print ".",
            sys.stdout.flush()
            val['contents'].seek(0);
            files_changed.add(filename)
            if val['acre_handler'] == 'binary':
                c.freebase.save_binary_file(val['id'], val['contents'],
                                            val['content_type'])
            else:
                contents = val['contents'].read()
                c.freebase.save_text_file(val['id'], contents,
                                          val['acre_handler'], val['content_type'])
                    
        if not trunk:
            time.sleep(1)
            c.freebase.create_app_version(c.options.appid, c.options.version, timestamp='__now__')
            c.log('updated version %s' % c.options.version, 'push')

        c.log('push succesfull, %s files affected' % len(files_changed), 'push')
        return True

    def __call__(self, trunk=False):

        c = self.context

        #validate options
        if not (c.options.graph and c.options.app):
            c.log('You have to supply a valid graph and app for a push', 'error')
            return False

        #are we pushing to trunk?
        if not self.context.options.version:
            trunk = True

        #chose the correct SVN branch (or trunk) depending on version
        svn_url = c.svn_branch_url()
        if trunk:
            svn_url = c.svn_trunk_url()

        c.log('starting push of %s to app %s version %s on graph %s' % (svn_url, c.options.app, c.options.version or 'trunk', c.options.graph), 'push')
        
        #checkout the code into a temporary directory
        local_dir = mkdtemp()
        
        cmd = ['svn', 'checkout', svn_url, local_dir]
        (success, message) = c.run_cmd(cmd)

        if not success:
            c.log('Unable to perform svn checkout', 'error')
            return False

        #push the checked out code
        result = self.push(local_dir, trunk=trunk)

        if not result:
            return False

        #if this was a push to a specific app version, then re-push trunk 
        #so that the current version is the same as trunk in SVN
        if not trunk:
            svn_url = c.svn_trunk_url()
            c.log('restoring trunk: %s' % svn_url, 'push')
            local_dir = mkdtemp()
            
            cmd = ['svn', 'checkout', svn_url, local_dir]
            c.run_cmd(cmd)
        
            result = self.push(local_dir, trunk=True)
            

        return result




class ActionStatic():
    
    def __init__(self, context):
        self.context = context

    def create_hash_for_directory(self, directory, static_files):

        c = self.context

        deploy_rev = None
        status, path = mkstemp()
        with open(path, "wb") as hash_file:
            for f in static_files:
                with open(os.path.join(directory, f), "rb") as static_file:
                    c.verbose(os.path.join(directory, f), subaction='hash file')
                    while True:
                        data = static_file.read(2**20)
                        if not data:
                            break
                        hash_file.write(data)
        with open(path, "rb") as hash_file:
            deploy_rev = c.hash_for_file(hash_file)

        return deploy_rev

    def deploy_static_files(self, source_dir, source_url, dest_dir, **kws):

        c = self.context
        #must return a list of filenames (js, css, img)
        files = []
        c.log('copying static files to deploy directory')

        ## LOAD MANIFEST ##

        # load app MANIFEST.sjs by doing an HTTP request for <app_url>/MANIFEST
        url = "%s/MANIFEST" % source_url
        mf = c.fetch_url(url, isjson=True)
        if not (mf and mf.get('result')):
            c.log('Aborting push of resource files - no manifest found!', 'error')
            return (False, files)

        mf = mf['result']

        ## CSS and JS ##

        # go through javascript and css bundles specified in the manifest
        # by doing an http request for <app_url>/MANIFEST/<bundle_name>
        # and copy them to the target directory
        for file_type in ['javascript', 'stylesheet']:
            for filename in mf[file_type]:
                file_url = "%s/MANIFEST/%s" % (source_url, filename)
                if kws:
                    file_url = "%s?%s" % (url, urllib.urlencode(kws))
                filename = os.path.join(dest_dir, filename)
                with open(filename, 'w') as dest_file:
                    for line in c.fetch_url(file_url):
                        dest_file.write(line)

        ## IMAGES ##
                        
        # for images, read the local directory since images are not bundled together
        # 2. svn list version and copy images (*.png, *.gif, etc.) to dest_dir
        img_files = [f for f in os.listdir(source_dir) if os.path.splitext(f)[1].lower() in IMG_EXTENSIONS]
        for f in img_files:
            src = os.path.join(source_dir, f)
            # in local acre dev, we use double extensions for static files including image files
            # convert double extensions to single extension
            dest = os.path.join(dest_dir, os.path.splitext(f)[0])
            shutil.copy2(src, dest)


        
        # read the destination directory and return the list of filenames
        # 3. if static files, import to svn deployed dir
        files = sorted([f for f in os.listdir(dest_dir) if os.path.splitext(f)[1].lower() in EXTENSIONS])
        return (True, files)


    def evaluate_resource_base_url(self):


        c = self.context

        # determine if we need to create a new deploy revision by
        # 1. determine the md5 hash of all the img files + javascript/stylesheet manifests sorted and concatenated together.
        branch_url = c.svn_branch_url()
        branch_dir = c.svn_branch_path()

        tempdir = mkdtemp()
        cmd = ['svn', 'checkout', branch_url, tempdir]
        c.run_cmd(cmd)

        # update MANIFEST static_base_url
        manifest = os.path.join(branch_dir, "MANIFEST.sjs")
        if not os.path.exists(manifest):
            c.log('No MANIFEST.sjs in app directory %s' % branch_dir)
            return False

        # 1. urlfetch static files from app url (*.mf.js/*.mf.css)
        deployed_dir = mkdtemp()
        url = c.app_url()
        # We need to pass use_acre_url=1, for the MANIFEST css_preprocessor to return consistent urls for css url declarations to
        # calculate deterministic hashes of all static files for an app.
        # 1. url(local.png) = http://2.localapp.site.freebase.dev.../local.png
        #                  != http://freebaselibs.com/static/freebase_site/localapp/abcdef.../local.png
        # 2. url(externalapp, external.png) = http://3.externalapp.site.freebase.dev.../external.png
        #                                  != http://freebaselibs.com/static/freebase_site/externalapp/abcdef.../external.png
        # This is needed since we have not yet set the MANIFEST static_base_url/image_base_url.
        # The static_base_url/image_base_url is determined by the md5 hash of all static files of an app
        # including the dynamically generated javascript/stylesheet MANIFEST files declared in mf.javascript and mf.stylesheet.
        # The mf.javascript files are deterministic since we go through the external apps MANIFEST/ entry point (i.e., .../MANIFEST/foo.mf.js).
        # The mf.stylesheet files also go through the external apps MANIFEST/ entry point (i.e., .../MANIFEST.foo.mf.css) but is
        # only deterministic if we DO NOT preprocess the css url(...) declarations since it uses the image_base_url.

        (success, static_files) = self.deploy_static_files(branch_dir, url, deployed_dir, use_acre_url=1)
        if not success:
            c.log('Could not get a list of files from the MANIFEST - unable to do HTTP request, or your app does not have a manifest.', 'fatal error')
            return False

        # deploy_rev is the md5 hash of all the static files sorted and concatenated together
        c.log('creating hash for static files')
        self.deploy_rev = self.create_hash_for_directory(deployed_dir, static_files)

        # update MANIFEST static_base_url
        c.log('updating the manifest file with the new deployment hash')
        base_url = c.static_server_url(self.deploy_rev)
        cfg = json.dumps({
            "static_base_url": base_url,
            "image_base_url": base_url
            })

        init_re = re.compile(r'\.init\s*\(\s*mf\s*\,\s*this.*$')
        temp = mkstemp()
        with open(temp[1], "w") as tmp:
            with open(os.path.join(manifest)) as mf:
                for line in mf.xreadlines():
                    tmp.write(init_re.sub('.init(mf, this, %s);' % cfg, line))
        shutil.copy2(temp[1], manifest)

        c.verbose('svn commit of branch directory %s' % branch_dir)
        msg = 'Update MANIFEST static_base_url'
        c.svn_commit(branch_dir, msg)    

        return True
        # acre push branch
        #ActionPush(self.context)()

    def inject_resources_with_base_url(self):

        c = self.context

        c.log('re-fetching static files with embedded deploy hash')

        url = c.app_url()
        branch_dir = c.svn_branch_path()
        deployed_url = c.svn_deployed_url(self.deploy_rev)
        c.log('static path is %s' % deployed_url)
        
        # check if a deployed_rev already exists or not
        cmd = ['svn', 'ls', deployed_url]
        (success, message) = c.run_cmd(cmd, exit=False)

        if success:
            c.log('Deployed directory already exists %s' % deployed_url)
            return True

        # deployed_rev does not exist, add it to svn    
        deployed_dir = mkdtemp()
        # now that we have deterministically calculated the deployed_rev and updated the MANIFEST static_base_url/image_base_url,
        # we now want to reget the static_files with the correct css url(...) pointing the http://freebaselibs...
        (success, static_files) = self.deploy_static_files(branch_dir, url, deployed_dir)
        if not success:
            c.log('Could not get manifest for your app', 'fatal error')
            return False


        c.log('injecting static server url into CSS files and minifying CSS')
        # css min
        css_files = [f for f in os.listdir(deployed_dir) if os.path.splitext(f)[1].lower() == ".css"]
        for css_file in css_files:
            c.verbose(css_file, 'css file')
            css_path = os.path.join(deployed_dir, css_file)

            # we should not have any css url declrations that look like 'url(http://3.template.site.freebase.dev...)'
            cmd = ['grep', '-E', 'url\s*\(\s*https?\:\/\/[0-9]+\.', css_path]
            r = c.run_cmd(cmd)
            if r:
                prompt = '{f} contains 1 or more acre url declrarations. Continue with deploying {rev} of {app} [y/n]?'.format(f=f, rev=self.deploy_rev, app=c.options.app)
                if raw_input(prompt).lower() != 'y':
                    sys.exit()

            with open(css_path, "r") as infile:
                min_css = cssmin(infile.read())
            with open(css_path, "w") as outfile:
                outfile.write(min_css)

        c.log('compiling (closure) js files')
        # js min (closure compiler)
        js_files = [f for f in os.listdir(deployed_dir) if os.path.splitext(f)[1].lower() == ".js"]
        for js_file in js_files:
            c.verbose(js_file, 'js file')
            js_path = os.path.join(deployed_dir, js_file)
            status, temppath = mkstemp()        
            with open(temppath, "w") as tempfile:
                cmd = [JAVA] + JAVA_OPTS + ["--js", js_path]
                subprocess.call(cmd, stdout=tempfile)
            shutil.copy2(temppath, js_path)

        msg = 'Create static file deployed directory version {version} for app {app}'.format(version=self.deploy_rev, app=c.options.app)
        cmd = ['svn', 'import', deployed_dir, deployed_url, '-m', '"%s"' % msg]
        c.run_cmd(cmd)

        c.log('***** NOTE: You have to restart the freebaselibs.com static servers for your resources to be available *****')


    def __call__(self):

        result = self.evaluate_resource_base_url()
        if not result:
            return False

        ActionPush(self.context)()

        self.inject_resources_with_base_url()

        return True

class ActionBranch():
    
    def __init__(self, context):
        self.context = context


    def __call__(self):

        c = self.context

        branch = c.svn_branch_url()
        cmd = ['svn', 'ls', branch]
        (r, output) = c.run_cmd(cmd, exit=False)

        if r:
            # if already in svn, no op
            return True
        
        trunk = c.svn_trunk_url()
        msg = 'Creating branch version {version} of app {app}'.format(version=c.options.version, app=c.options.app)
        c.log(msg)
        cmd = ['svn', 'copy', trunk, branch, '--parents', '-m', '"acredeploy: %s"' % msg]
        (r, output) = c.run_cmd(cmd)

        return r

class ActionCreate():
    
    def __init__(self, context):
        self.context = context


    def __call__(self):
        c = self.context

        if not (c.options.app and c.options.graph):
            c.log('You must specify the app key (e.g. "schema") and a graph to create a new app', 'error')
            return False

        c.log('create app %s in graph %s' % (c.options.app, c.options.graph))
        
        if bool(c.freebase.mqlread({"id": c.options.appid})):
            c.log('app already exists')
        else:
            success = c.freebase_login()
            if not success:
                c.log('failed to get freebase credentials - aborting app creation' , 'error')
                return False
            
            name = "freebase.com %s" % c.options.app            
            c.freebase.create_app(c.options.appid, name=name, extra_group="/m/043wdvg" )
            
        return True

        
    
def main():

    # OPTION PARSING

    valid_actions = [
        ('branch', 'creates a branch of your app', ActionBranch),
        ('push', 'pushes a specified directory to an app version', ActionPush),
        ('static', 'generates and deployes static bundles to the edge servers', ActionStatic),
        ('create', 'creates an app', ActionCreate),
        ('release', 'release a specific version of an app')
        ]


    usage = '''%prog action [options]
\nActions:
'''
    usage += '\n'.join(['\t%s\t%s' % a[:2] for a in valid_actions])

    parser = OptionParser(usage=usage)
    parser.add_option('-g', '--graph', dest='graph', 
                      help='acre graph - i.e. otg|sandbox|qa')
    parser.add_option('-u', '--user', dest='user', 
                      help='freebase username - e.g. namesbc')
    parser.add_option('-v', '--version', dest='version', default='',
                       help='a version of the app - e.g. 12')
    parser.add_option('-b', '--verbose', dest='verbose', action='store_true', 
                      default=False, help='verbose mode will print out more debugging output')
    parser.add_option('-a', '--app', dest='app', default='no_app_id',
                      help='an app id - e.g. /user/namesbc/mysuperapp or homepage - separate multiple ids with commas')

    (options, args) = parser.parse_args()

    if not len(args) or args[0] not in [a[0] for a in valid_actions]:
        parser.error('You did not provide a valid action')
        exit(-1)

    #all options and args are good, let's do some clean-up / arg expansion


    if options.app:
        options.appid = '/freebase/site/%s' % options.app


    context = Context(options)


    for action in args:
        
        context.set_action(action)
        for valid_action in valid_actions:
            if action == valid_action[0]:
                
                result = valid_action[2](context)()

                if not result:
                    print 'FAILED: action %s failed' % action
                else:
                    print 'SUCCESS: action %s ended succesfully' % action


if __name__ == '__main__':
    main()
