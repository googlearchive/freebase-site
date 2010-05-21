#!/usr/bin/env python
import sys
import os
import hashlib
import urllib2
import re

try:
    import json
except ImportError:
    import simplejson as json

from freebase.api import HTTPMetawebSession, MetawebError
from freebase.api.mqlkey import quotekey, unquotekey

null, true, false = None, True, False

DEFAULT_ACRE_SERVICE_URL = "http://acre.branch.qa.metaweb.com"

SHORT_GRAPH_MAP = {
    "otg":"http://acre.freebase.com",
    "sandbox":"http://acre.sandbox-freebase.com",
    "trunk":"http://trunk.qa.metaweb.com",
    "branch":"http://branch.qa.metaweb.com"
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
            if id:
                metadata['id'] = id
                f = file(os.path.join(directory, '.metadata'), 'w+')
                json.dump(metadata, f)
                f.close()
            else:
                raise Exception("need to supply an id if .metadata is not present")
        else:
            mdf = file(mdpath)
            metadata = json.load(mdf)

        def handle_file(f):
            script = {'id':null, 'name':null, 'handler':null,
                      'content_type':null, 'contents':null, 'extension':null}
            fn, ext = f.rsplit('.', 1)
            script['id'] = metadata['id'] + '/' + quotekey(fn)
            script['extension'] = ext
            script['name'] = quotekey(fn)
            script['contents'] = file(os.path.join(directory, f))
            script['blob_id'] = hashlib.sha256(script['contents'].read()).hexdigest()
            ct, handler = extmap.type_for_extension(ext)
            script['handler'] = handler
            script['content_type'] = ct

            return script

        metadata['files'] = {}

        # Skip . .. .xxxx xxx.sh and directories
        for f in os.listdir(directory):
            basename, extension = os.path.splitext(f)
            if extension in ['.sh'] or f.startswith('.') or os.path.isdir(os.path.join(directory, f)):
                print >> sys.stderr, "Info: Skipping "+f
                continue

            d = handle_file(f)

            metadata['files'][d['name']] = d

        return metadata

class AcrePush(object):
    def __init__(self, user, pw, acrehost=DEFAULT_ACRE_SERVICE_URL):

        u = urllib2.urlopen(acrehost+'/acre/status').read()
        me_server = u.split('\n')[2].split(':')[1].strip()
        self.fb = HTTPMetawebSession(me_server, cookiefile='', 
                                     acre_service_url=acrehost)

        self.fb.login(user, pw)

    def push(self, directory, version, id=None, patch=False):
        oda = OnDiskAcreApp(directory, id)

        try:
            self.fb.get_app(oda.metadata['id'])
        except MetawebError:
            if patch:
                usage("Cannot patch a non-existant app")
            self.fb.create_app(oda.metadata['id'])

        if not patch:
            self.fb.delete_app_all_files(oda.metadata['id'])

        for key, val in oda.metadata['files'].iteritems():
            # resest filedescriptor to beginning of file so we can read it again
            val['contents'].seek(0)
            if val['handler'] == 'binary':
                self.fb.save_binary_file(val['id'], val['contents'],
                                         val['content_type'])
            else:
                self.fb.save_text_file(val['id'], val['contents'].read(),
                                       val['handler'], val['content_type'])


        self.fb.create_app_version(oda.metadata['id'], version)



def usage(msg=None):
    if msg:
        print >> sys.stderr, "%s: %s" %(sys.argv[0], msg)
        print >> sys.stderr, ""

    print >> sys.stderr, "%s [-i id] [-h acrehost] [-u username] [-p password] [-P] directory version" % sys.argv[0]
    sys.exit(1)

if __name__ == '__main__':
    import getopt

    try:
        args, remains = getopt.getopt(sys.argv[1:], "i:h:u:p:P")
    except getopt.GetoptError, e:
        usage(e)

    if len(remains) != 2:
        usage("must supply directory and version")

    id, host, user, pw, patch = None, DEFAULT_ACRE_SERVICE_URL, None, None, False
    for a in args:
        if a[0] == '-i':
            id = a[1]
        elif a[0] == '-h':
            host = a[1]
        elif a[0] == '-u':
            user = a[1]
        elif a[0] == '-p':
            pw = a[1]
        elif a[0] == '-P':
            patch = True

    if not user:
        user = raw_input("Username: ")

    import getpass
    if not pw:
        pw = getpass.getpass()

    mhost = SHORT_GRAPH_MAP.get(host);
    if not host.startswith("http://") and not mhost:
        usage("Host must start with http:// or be a known short name (e.g. trunk, branch, otg, sandbox)")

    if mhost:
        host = mhost
        
    ap = AcrePush(user, pw, host);
    ap.push(remains[0], remains[1], id, patch)
