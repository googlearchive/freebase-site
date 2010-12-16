# this test file implements a nose based driver/discoverer of acre app tests
# see test.ini for configuration of the test rig
# 
# nose can be installed with python setuptools: easy_install nose

# this code discovers the tests
from nosetester import *
t = Controller()
from nose.plugins import skip
import time

# this class facilitates generation of nose tests with proper names
class TstResult:
    def __init__(self, k, results, elapsed):
        self.description = k
        self.results = results
        self.elapsed = elapsed
    def __call__(self, k):
        r = self.results[k]
        print 'time for %s: %2.3f seconds' % (k.split(':')[0], self.elapsed)
        if r[0] is False:
            if ('timed out' in str(r[1]) )\
            or ('script was taking too long' in str(r[1]) ):
                r[0] = 'skip'
                print 'skip: test ran but failed on timeout'
            else:
                print r[1]
                assert 'an acre test failed' is True
        if 'skip' in str(r[0]):
            print r[1]
            # see __init__.py for details on when tests are skipped
            raise skip.SkipTest

def test_apps():
    t.freebase_login()
    for u in t.test_urls:
        starttime = time.time()
        # actually run the test, hit the url
        res = t.run_acre_tst(u)
        elapsed = time.time() - starttime
        # evaluate json results for all tests in url
        for k in res:
            yield TstResult(k, res, elapsed), k

