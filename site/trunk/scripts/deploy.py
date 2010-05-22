#!/usr/bin/env python
import sys, os
import urllib2
import json
import subprocess
from tempfile import TemporaryFile, mkstemp
from cssmin import cssmin
from optparse import OptionParser
import dir
from pprint import pprint


JAVA = os.environ.get("JAVA_EXE", "java")
COMPILER = os.path.join(dir.scripts, "compiler.jar")
JAVA_OPTS = ["-jar", COMPILER, "--warning_level", "QUIET"]

cmd_options = OptionParser()

# base_url + "/MANIFEST" will return manifest for the app
cmd_options.add_option('-s', '--src', dest='src',
                       help="base url of app being deployed")

# output dir where all static files will be deployed to
cmd_options.add_option('-d', '--dest', dest='dest',
                       help="directory to deploy to")
options, args = cmd_options.parse_args()

# load app MANIFEST.MF
url = "%s/MANIFEST" % options.src
body = ''.join(urllib2.urlopen(url).readlines())
mf = json.loads(body).get('result')

# get each stylesheet page, cssmin and copy to outdir
for page in mf.get('stylesheet'):
    url = "%s/MANIFEST/s/%s" % (options.src, page)
    css = ''.join(urllib2.urlopen(url).readlines())    
    min = cssmin(css)
    filename = os.path.join(options.dest, page)
    with open(filename, "w") as f:
        f.write(min)
    
# get each javascript page, compile (closure compiler) and copy to outdir
for page in mf.get('javascript'):
    url = "%s/MANIFEST/s/%s" % (options.src, page)
    
    status, path = mkstemp(text=True)    
    with open(path, 'w') as temp:
        for line in urllib2.urlopen(url).readlines():
            temp.write(line)

    filename = os.path.join(options.dest, page)
    
    with open(filename, 'w') as outfile:
        cmd = [JAVA] + JAVA_OPTS + ["--js", path]
        subprocess.call(cmd, stdout=outfile)

    # delete temp file
    os.remove(path)

    

    
    
            


            
