"""
Basic test driver to be used with nose (run nosetests in this dir)
"""
import os
import sys
import urllib2
import cookielib
import re
import simplejson
import urllib
import time

import pkg_resources

here_dir = os.path.dirname(os.path.abspath(__file__))
conf_dir = os.path.dirname(os.path.dirname(here_dir))
sys.path.insert(0, conf_dir)
pkg_resources.working_set.add_entry(conf_dir)
conf_file = here_dir + '/test.ini'

from nose.tools import *


class Controller:

    def __init__(self):
        import ConfigParser
        self.cookiefile = "./cookies.lwp",
        self.cookiejar = cookielib.LWPCookieJar("./cookies.lwp")

        # Install cookie and redirect handlers.
        self.opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(self.cookiejar))
        urllib2.install_opener(self.opener)

        # set test url
        self.data = None
        self.method = "GET"
        self.headers = None
        config = ConfigParser.ConfigParser()
        parsed = config.read([conf_file])

        if len(parsed) != 1:
            print "no config file read from  %r" % conf_file
            sys.exit(1)
        
        self.username = config.get('apptests', 'username')
        self.password = config.get('apptests', 'password')
        
        acre_service_host = config.get('apptests', 'acre_service_host')
        acre_service_port = config.getint('apptests','acre_service_port')
        self.acre_service_port = acre_service_port
        if acre_service_port != 80:
            self.acre_service = '%s:%s' % (acre_service_host, acre_service_port)
        else:
            self.acre_service = acre_service_host

        freebase_service_host = config.get('apptests', 'freebase_service_host')
        if '.freebase.com' in freebase_service_host or freebase_service_host.startswith('freebase.com'):
            assert 'testing against freebase.com is bad, use sandbox-freebase.com' is True
        self.freebase_service_host = freebase_service_host
        freebase_service_port = config.getint('apptests','freebase_service_port')
        if freebase_service_port != 80:
            self.freebase_service = '%s:%s' % (freebase_service_host, freebase_service_port)
        else:
            self.freebase_service = freebase_service_host

        self.apps_path = config.get('apptests','apps_path')
        app_list = config.get('apptests','app_list')
        if app_list == '': 
            self.app_list = None
        else:
            self.app_list = re.split(' +', app_list)
        self.app_config = {}
        self.test_urls = []
        self.path_for_url = {}
        self.gen_test_urls()

    def gen_test_urls(self):
        site_files = os.listdir(self.apps_path)
        if self.app_list: site_files = self.app_list
        for f1 in site_files:
            app_path = self.apps_path + '/' + f1
            if os.path.isdir(app_path):
                self.read_app_config(app_path)
                app_files = os.listdir(app_path)
                for f2 in app_files:
                    m = re.match('(test_.+)\.sjs', f2) 
                    if m:
                        t = m.groups()[0]
                        require_login = self.get_tst_attribute(app_path, 'all', 'fbauth')
                        if not require_login:
                            require_login = self.get_tst_attribute(app_path, t, 'fbauth')
                        if require_login is True:
                            u = 'http://devel.' + \
                                 self.freebase_service_host + \
                                 ':' + str(self.acre_service_port) + \
                                 '/' + f1 + '/' + t + '?output=json'
                        else:
                            u = 'http://' + f1 + '.site.freebase.dev.' + \
                                self.acre_service + '/' + t + '?output=json'
                        self.test_urls.append(u)  
                        self.path_for_url[u] = app_path
        for u in  self.test_urls: print u
                                  
    def get_tst_attribute(self, app_path, key, attr):
        data = self.app_config[app_path]
        print data
        if data.get('tests'):
            for k, v in data['tests'].iteritems():
                if k == key:
                    print "MATCH! %s" % k
                    ret = v.get(attr)
                    return ret
        else:
            return None

    def read_app_config(self, app_path):
        cfg = app_path + '/' + 'CONFIG.json.json'
        self.app_config[app_path] = {}
        if os.path.exists(cfg):
            data = open(cfg).read()
            try:
                self.app_config[app_path] = simplejson.loads(data)
            except:
                print 'WARNING: %s is not a valid json file' % cfg
                
    def run_acre_tst(self, url):
        fails = 0
        results = {}
        app_path = self.path_for_url.get(url)
        bugs = self.get_tst_attribute(app_path, 'all', 'bugs')
        if bugs:
            print 'SKIP. this whole app has bugs %s' % ' '.join(bugs)
            results[url] = ['skip', 'app has known bugs %s' % bugs]
            return results
        r=self.request_url(url)
        if r is None:
            msg = 'url request failed for %s' % url
        elif 'body_json' not in r: 
            msg = 'no valid json found at %s' % url
        else:
            msg = None
        if msg:
            results[url] = [False, msg] 
            return results
        thisresult = r['body_json']
        modules = thisresult['testfiles'][0]['modules']
        path = thisresult['testfiles'][0]['run_url']
        test_prefix = thisresult['testfiles'][0]['file']
        bugs = self.get_tst_attribute(app_path, test_prefix, 'bugs')
        print "TEST PREFIX %s" % test_prefix
        if bugs:
            print 'SKIP. this test file has bugs %s' % ' '.join(bugs)
            results[test_prefix] = ['skip', 'test file has known bugs %s' % bugs]
            return results
        print "BUGS %s" % bugs
        target = path
        output = ''
        for m in modules:
            mname = m['name']
            if mname == 'DEFAULT':
                mname = ''
            else:
                mname = '.' + mname
            for t in m['tests']:
                name = t['name'].replace(' ', '_')
                runtime = t.get('runtime')
                f = int(t['failures'])  
                fails += f
                short_testid = '%s:%s%s' % (test_prefix, mname, name)
                testid = '%s:%s%s' % (path, mname, name)
                bugs = self.get_tst_attribute(app_path, short_testid, 'bugs')
                if bugs:
                  print 'SKIP. this test has bugs %s' % ' '.join(bugs)    
                  results[testid] = ['skip', 'test has known bugs %s' % bugs]
                  continue
                msg = testid + '.'*(77-len(testid))
                if f > 0:
                    # test assertions failed
                    flog = self.get_fail_logs(t['log'])
                    output = 'FAIL\n' + flog
                    output += '-'*77 + '\n'
                    output = msg + output
                    results[testid] = [False, flog]
                else:
                    results[testid] = [True, None]
        
        if fails > 0:
            print 'some tests for %s failed' % url
            print output
            #assert 'some tests failed' is True
        return results

    def get_fail_logs(self, obj):
        out = ''
        i = 0
        for r in obj:
            i += 1
            if r['result'] is False or r['result'] is None:
                out += 'assert %s: %s\n' % (i, r['message'])
        return out

    def get_response_headers(self, response=None):
        p = re.compile("[\r\n]+")
        if response is None:
            response = self.response
        _headers = p.split( "%s" % response.info())
        headers = {}; 

        for _h in _headers:
            p = re.compile(":")
            if p.search("%s" % _h):
                _key = p.split("%s" % _h, maxsplit=1)
                key =  _key[0].strip()
                value = _key[1].strip()

                if headers.has_key(key):
                    if  isinstance (headers[key], list):
                        headers[key].append(value)
                    else:
                        headers[key] = [headers[key], value]
                else:
                    headers[key] = value

        self.response_headers = headers

        return self.response_headers

    def parse_headers(self, headers=None):
        #print self.response.info()
        p = re.compile("[\r\n]+")
        if headers is None:
            headers = p.split("%s" % self.response.info())
        else:
            headers = p.split("%s" % headers)
        #print "headers: %s " % headers
        sep = re.compile('[a-zA-Z\-]+:[\s]*')
        for h in headers:
            #print "header line: " + h
            h = sep.split(h)
            if len(h) > 1:
                field = h.pop(0)
                value = h.pop()
                value = (value.rstrip()).lstrip()
                self.response.headers[field] = value
                #print "field: " + field + " value: " + value


    def freebase_login(self):
        username = self.username
        password = self.password
        host = self.freebase_service
        self.cookiefile = "./cookies.lwp"
        self.cookiejar = cookielib.LWPCookieJar()
        self.opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(self.cookiejar))
        urllib2.install_opener(self.opener)
        data = urllib.urlencode({ "username":username, "password":password, 'mw_cookie_scope':'domain' })
        url = "http://%s/api/account/login?%s" % (host, data)
        print "Logging in: %s" % url
  
        try:
            request = urllib2.Request(url)
            self.cookiejar.add_cookie_header(request)
            respobj = urllib2.urlopen(request)
            respdata = respobj.read()
            resphead = respobj.info()
            cookies = self.cookiejar.make_cookies(respobj, request)
            for c in cookies:
                print "Cookie: %s" % c

            #print "Got response: %s" % respdata

        except urllib2.HTTPError, e:
            print "Login failed: %s " % e
            print e.fp.read()
            raise

        except Exception, e:
            print "Login failed: %s " % e
            raise


    def freebase_logout(self): 
        data = urllib.urlencode({ 'mw_cookie_scope':'domain' })
        logout_url = "%s/api/account/logout?%s" % (self.freebase_service, data)
        headers = { "X-Metaweb-Request" : 1 }            
        response = self.request_url(logout_url )

    def request_url(self, url, method='GET', data=None, headers={}):

        try:
            print "\nRequesting url %s" % url
            if headers: print "     Adding headers: %s" % headers
           
            if data is not None and (method=="POST" or method==None): 
                headers['Content-Type'] = "application/x-www-form-urlencoded"
                print "     Posting data: %s" % data
                self.request = urllib2.Request(url, data=data, headers=headers)
            else:
                self.request = urllib2.Request(url, headers=headers)
                
            self.cookiejar.add_cookie_header(self.request)
            self.response = self.opener.open(self.request)
            sys.stdout.write('\nURL %s TIME: %s\n' % (url, time.time()))

            print "    URL: %s" % url

            result = { "request_url": url, 
                     "body": self.response.read(), 
                     "response": self.response, 
                     "response_url" : self.response.geturl(), 
                     "headers": self.get_response_headers()
            }

            cookies = self.cookiejar.make_cookies(self.response, self.request)
            for c in cookies:
                print "    Got cookie: %s" % c


            try:
                result['body_json'] = simplejson.loads( result['body'] )
            except Exception, e:
                print "    WARNING:  output is not in json format"

            if result.has_key('body_json'):
                print "    Result: %s" % result['body_json']
            elif result.has_key('body_result'):
                print "    Result: %s" % result['body_result']
            else:
                print "    Result: %s" % result['body']

            return result

        except urllib2.HTTPError, e:
            result = { "body": e.fp.read(), 
                       "response": e,
                       "headers": e.hdrs, 
                       "code": e.code, 
                       "info": e.info, 
                       "msg":  e.msg, 
                       "newurl": e.url,
                       "request_url": url }

            print "    URL: %s?%s" % (url, data)
            if result['code'] == 302 or result['code'] == 301:
                print "    Got redirect."
                print "    Redirecting to %s" % result['newurl']
                return self.request_url(result['newurl'])

            else:
                print "    Got code %s" % (e.code)
            if result['code'] != 200:
                print "Got a non-200 response" 

            return result

        except Exception, e:
            print "    Caught unexpected error %s\n" % e
            for p in e:
                print "    %s" % p


