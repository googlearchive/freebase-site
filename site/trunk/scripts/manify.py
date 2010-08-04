#!/usr/bin/env python
import os, sys
from optparse import OptionParser
import dir
import subprocess
import re
from tempfile import mkstemp
import shutil

cmd_options = OptionParser()
options, args = cmd_options.parse_args()

if not args:
    print "\n\nUsage: python manify.py <version>\n\n"
    sys.exit()


def is_int(str):
    '''
    is str an int?
    '''
    try:
        int(str)
        return True
    except ValueError, e:
        return False

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

version = args[0]
if not is_int(version):
    print "\n\nversion needs to an integer"
    sys.exit()

search_path = os.path.abspath(os.path.join(dir.scripts, ".."));

cmd = ['find', search_path, "-name", "routing", "-prune", "-o", "-name", "MANIFEST.sjs"]
mfs = run_cmd(cmd)

app_re = re.compile(r'(\s*)[\"\']?(\w+)[\"\']?\s*\:\s*[\"\']?\/\/(\d+\.)?(\w+)\.site\.freebase\.dev[\"\']?\s*(\,)?\s*?')
import pdb
for mf in mfs.split("\n"):
    if not mf.endswith("MANIFEST.sjs"):
        continue
    print mf
    temp = mkstemp()
    with open(temp[1], "w") as outfile:
        with open(mf, "r") as infile:
            for line in infile.xreadlines():
                m = app_re.match(line)
                if m:
                    print m.groups()
                    tab = m.group(1)
                    label = m.group(2)
                    app = m.group(4)
                    comma = m.group(5) or ""
                    outfile.write('{tab}"{label}": "//{version}.{app}.site.freebase.dev"{comma}\n'.format(tab=tab, label=label, version=version, app=app, comma=comma))
                else:
                    outfile.write(line)
                    
    shutil.copy(temp[1], mf)
                
