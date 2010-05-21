#!/usr/bin/env python
import os
from optparse import OptionParser
import urllib
import urllib2
import json
import subprocess

cmd_options = OptionParser()
cmd_options.add_option('-u', '--url', dest='url',
                       default="http://acre.branch.qa.metaweb.com",
                       help="acre host i.e., http://acre.sandbox-freebase.com")

options, args = cmd_options.parse_args()

def scripts_dir():
    path = os.path.join(os.getcwd(), __file__)    
    dir = os.path.dirname(path)    
    return os.path.abspath(dir)

def site_dir():
    path = os.path.join(os.getcwd(), __file__)    
    dir = os.path.dirname(path)
    dir = os.path.join(dir, "../site")
    return os.path.abspath(dir)

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
        url = "%s/appeditor/get_app?%s" % (options.url, urllib.urlencode(dict(appid=appid)))
        app_info = get_json(url).get('result')
        versions = app_info.get('versions', [])
        versions = [v for v in versions if is_int(v['name'])]
        versions.sort(key=lambda x: int(x['name']))
        if versions:
            return int(versions[-1]['name']) + 1    
    except urllib2.HTTPError, e:
        pass
    return 1


base_site_dir = site_dir()
base_scripts_dir = scripts_dir()

for arg in args:    
    app, ver = arg.split(":", 1) if ":" in arg else (arg, None)

    appid = "/freebase/site/%s" % app

    if not ver:
        ver = next_version(appid)
            
    print appid, ver

    dir = os.path.join(base_site_dir, app)
    cmd = [os.path.join(base_scripts_dir, 'acrepush.py'),
           '-i', appid,
           '-h', options.url,
           dir, str(ver)]

    print " ".join(cmd)

    subprocess.call(cmd)

    
