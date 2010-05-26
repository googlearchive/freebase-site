#!/usr/bin/env python
import sys, os, hashlib, urllib2, tempfile, re, pwd
import pdb

try:
    import json
except ImportError:
    import simplejson as json

from freebase.api import HTTPMetawebSession, MetawebError
from freebase.api.mqlkey import quotekey, unquotekey

class AcrepushError(Exception):
    pass

null, true, false = None, True, False

DEFAULT_ACRE_SERVICE_URL = "http://acre.branch.qa.metaweb.com"

SHORT_GRAPH_MAP = {
    "otg":"http://acre.freebase.com",
    "sandbox":"http://acre.sandbox-freebase.com",
    "trunk":"http://acre.trunk.qa.metaweb.com",
    "branch":"http://acre.branch.qa.metaweb.com"
}

class extmap(object):
    FILE_TYPES = {
        'png':'image/png',
        'jpg':'image/jpeg',
        'gif':'image/gif',
        'html':'text/html',
        'css':'text/css',
        'js':'text/javascript'
        }

    @classmethod
    def type_for_extension(cls, ext):
        ct = cls.FILE_TYPES.get(ext, 'text/plain')
        
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

def dir_basename(d):
    if d.endswith("/"):
        d = d[:-1]
    return os.path.basename(d)

class OnDiskAcreApp(object):
    def __init__(self, directory, id):
        self.metadata = self._metadata(directory, id)
    
    def _metadata(self, directory, id):
        mdpath = os.path.join(directory, '.metadata')
        if not os.path.exists(mdpath):
            metadata = {}
        else:
            mdf = file(mdpath)
            metadata = json.load(mdf)
            mdf.close()

        if id:
            metadata['id'] = id
            f = file(os.path.join(directory, '.metadata'), 'w+')
            json.dump(metadata, f)
            f.close()

        if 'id' not in metadata:
            raise Exception("need to supply an id if .metadata is not present")

        def handle_file(f):
            script = {'id':null, 'name':null, 'acre_handler':null,
                      'content_type':null, 'contents':null, 'extension':null}
            fn, ext = f.rsplit('.', 1)
            script['id'] = metadata['id'] + '/' + quotekey(fn)
            script['extension'] = ext
            script['name'] = quotekey(fn)
            script['unquoted_filename'] = fn
            script['contents'] = file(os.path.join(directory, f))
            script['SHA256'] = hashlib.sha256(script['contents'].read()).hexdigest()
            ct, handler = extmap.type_for_extension(ext)
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
                print >> sys.stderr, 'WARNING: file %s will override contents of %s' % (f, d['name'])

            metadata['files'][d['name']] = d

        return metadata

class AcrePush(object):
    def __init__(self, acrehost=DEFAULT_ACRE_SERVICE_URL):

        u = urllib2.urlopen(acrehost+'/acre/status').read()
        me_server = u.split('\n')[2].split(':')[1].strip()
        cookiefile = '/tmp/freebase-python-cookie-jar-%s' %  pwd.getpwuid( os.getuid() )[ 0 ]
        #pdb.set_trace()
        self.fb = HTTPMetawebSession(me_server, cookiefile=cookiefile, acre_service_url=acrehost)

    def get_credentials(self, user=None, pw=None):

        try:
            if not user:
                user = raw_input("Username: ")

            import getpass
            if not pw:
                pw = getpass.getpass()
        except KeyboardInterrupt:
            print >> sys.stderr, "\nPush aborted."
            return (None, None)

        return (user, pw)

    def print_app_diff(self, delete_files, push_files, ignored_files):
        
        for filename in ignored_files:
            print >> sys.stderr, "?\t%s" % filename
        for filename,d in delete_files.iteritems():
            if filename not in push_files.keys():
                print >> sys.stderr, "R\t%s\t(%s)" % (d.get('unquoted_filename'), d.get('reason', ''))
                
        for filename,d in push_files.iteritems():
            if filename in delete_files.keys() or d.get('reason', '') == 'changed content':
                print >> sys.stderr, "M\t%s\t(%s)" % (d.get('unquoted_filename'), d.get('reason', ''))
            else:
                print >> sys.stderr, "A\t%s\t(%s)" % (d.get('unquoted_filename'), d.get('reason', ''))
                    


    def get_app_diff(self, graph_app, ondisk_app):
        graph_files, local_files = graph_app['files'], ondisk_app.metadata['files']

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


        self.print_app_diff(delete_files, push_files, ondisk_app.metadata['ignored_files'])

        return (delete_files, push_files)

    def push(self, directory, version, id=None, dry=False, user=None, pw=None):
        ondisk_app = OnDiskAcreApp(directory, id)
        graph_app = None
        create_app = False
        try:
            graph_app = self.fb.get_app(ondisk_app.metadata['id'])
        except MetawebError:
            create_app = True

        delete_files, push_files = {}, ondisk_app.metadata['files']

        if graph_app:
            (delete_files, push_files) = self.get_app_diff(graph_app, ondisk_app)

        if dry:
            print "Not making any changes (dry run)"
            return


        ###### dry run until this point ##########

        if version or len(delete_files.keys()) or len(push_files.keys()) or create_app:
            (user, pw) = self.get_credentials(user, pw)
            if not (user and pw):
                raise AcrepushError('You must specify a valid and username and password')
            self.fb.login(user, pw)

        if create_app:
            self.fb.create_app(ondisk_app.metadata['id'])
            
        if not (len(delete_files.keys()) or len(push_files.keys())):
            print "No files affected."
            return

        files_changed = set()
        if not (user and pw):
            return

        for filename,val in delete_files.iteritems():
            print ".",            
            self.fb.delete_app_file(ondisk_app.metadata['id'], unquotekey(filename))
            files_changed.add(filename)

        for filename, val in push_files.iteritems():
            print ".",            
            val['contents'].seek(0);
            files_changed.add(filename)
            if val['acre_handler'] == 'binary':
                self.fb.save_binary_file(val['id'], val['contents'],
                                         val['content_type'])
            else:
                self.fb.save_text_file(val['id'], val['contents'].read(),
                                       val['acre_handler'], val['content_type'])



        if version:
            self.fb.create_app_version(ondisk_app.metadata['id'], version)
            print >> sys.stderr, 'Updated version %s' % version


        print "\nPush succesfull, %s files affected" % len(files_changed)
        

def usage(msg=None):
    if msg:
        print >> sys.stderr, "%s: %s" %(sys.argv[0], msg)
        print >> sys.stderr, ""

    print >> sys.stderr, "%s [-i id] [-h acrehost] [-u username] [-p password] [-d] directory [version]" % sys.argv[0]
    sys.exit(1)

def push(id, host, directory,user=None, pw=None, dry=False, version=None):

    mhost = SHORT_GRAPH_MAP.get(host);
    if not host.startswith("http://") and not mhost:
        usage("Host must start with http:// or be a known short name (e.g. trunk, branch, otg, sandbox)")

    if mhost:
        host = mhost

    ap = AcrePush(host);
    ap.push(directory, version, id, dry, user, pw)


if __name__ == '__main__':
    import getopt

    try:
        args, remains = getopt.getopt(sys.argv[1:], "i:h:u:p:d")
    except getopt.GetoptError, e:
        usage(e)

    if not len(remains):
        usage("must supply app directory ")

    directory, version = remains[0], None
    if len(remains) > 1:
        version = remains[1]

    id, host, user, pw, dry = None, DEFAULT_ACRE_SERVICE_URL, None, None, False
    for a in args:
        if a[0] == '-i':
            id = a[1]
        elif a[0] == '-h':
            host = a[1]
        elif a[0] == '-u':
            user = a[1]
        elif a[0] == '-p':
            pw = a[1]
        elif a[0] == '-d':
            dry = True

        
    push(id, host, directory, user, pw, dry, version)
