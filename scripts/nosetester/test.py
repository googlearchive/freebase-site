# this test file implements a nose based driver/discoverer of acre app tests
# see test.ini for configuration of the test rig
# 
# nose can be installed with python setuptools: easy_install nose

# this code discovers the tests
from nosetester import *
t = Controller()
from nose.plugins import skip

# this class facilitates generation of nose tests with proper names
class TstResult:
    def __init__(self, k, results):
        self.description = k
        self.results = results
    def __call__(self, k):
        r = self.results[k]
        if r[0] is False:
            print r[1]
            assert 'an acre test failed' is True
        if r[0] == 'skip' :
            # see __init__.py for details on when tests are skipped
            raise skip.SkipTest

def test_apps():
    t.freebase_login()
    for u in t.test_urls:
        # actually run the test, hit the url
        res = t.run_acre_tst(u)
        # evaluate json results for all tests in url
        for k in res:
            yield TstResult(k, res), k

