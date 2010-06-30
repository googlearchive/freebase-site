import sys, os, hashlib, urllib2, tempfile, re, pwd
from freebase.api import HTTPMetawebSession, MetawebError
from freebase.api.mqlkey import quotekey, unquotekey
import urllib2
import httplib
import cookielib
import re
from unittest import TestCase
import urllib
from urllib2 import Request
import getpass
PODS = {
    "otg":{ 
        "acre":"http://acre.freebase.com",
        "me":"www.freebase.com"
     },
    "sandbox":{
        "acre":"http://acre.sandbox-freebase.com",
        "me":"www.sandbox-freebase.com"
    },
    "trunk":{
        "acre":"http://acre.trunk.qa.metaweb.com",
        "me":"trunk.qa.metaweb.com"
    },
    "branch":{
        "acre":"http://acre.branch.qa.metaweb.com",
        "me":"branch.qa.metaweb.com"
    },
    "qa" : {
        "acre":"http://acre.branch.qa.metaweb.com",
        "me":"branch.qa.metaweb.com"
    },    
    "local":{
        "acre":"http://ae.trunk.qa.metaweb.com:8115",
        "me":"trunk.qa.metaweb.com"
    }
}

def _get_metaweb_session(pod_name, username, password):
    pod = PODS[pod_name]
    cookiefile = '/tmp/freebase-python-cookie-jar-%s' %  pwd.getpwuid( os.getuid() )[ 0 ]
    #cookiefile = "./cookies.lwp";
    session = HTTPMetawebSession(pod['me'], 
                                 cookiefile=cookiefile,
                                 acre_service_url=pod['acre'])
    session.login(username=username, password=password)
    return session

def exists(id, session):
    return bool(session.mqlread({"id":id}))

def create_app(app_key, session):
    # create the app under the user's namespace
    app_id = "/freebase/site/%s" % (app_key)
    
    if exists(app_id, session):
        print "That app already exists!" 
        sys.exit(1)

    name = "freebase.com %s" % app_key
    session.create_app(app_id, name=name, extra_group="/m/043wdvg" )

if __name__ == '__main__':
    #session = _get_metaweb_session(pod, username, password)
    usage = "usage: %prog [options] app_key"

    from optparse import OptionParser
    parser = OptionParser(usage=usage)
    parser.add_option("-p", "--password", action="store", dest="password", default=None, help="The user's password")
    parser.add_option("-u", "--username", action="store", dest="username", default=None, help="The user's username")
    parser.add_option("-g", "--graph", action="store", dest="pod", default="branch", help="The pod you want to use for an api server - otg, sandbox, trunk or branch")
    
    (options, args) = parser.parse_args()

    if len(args) != 1:
        print "You must provide an app key!"
        sys.exit(1)

    username = options.username or raw_input("Username: ")
    password = options.password or getpass.getpass()
    pod = options.pod 

    try:
        session = _get_metaweb_session(pod, username, password)
    except Exception, e:
        print "auth failed!"
        sys.exit(1)

    app_key = args[0]

    create_app(app_key, session)

    print "success!"

