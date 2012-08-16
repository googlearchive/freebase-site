# -*- coding: utf-8 -*-

import logging
import random
import sys
import time
from selenium import webdriver
import utils
FbTestException = utils.FbTestException

# Copyright 2012, Google Inc.
# Licensed under the BSD 3-Clause License. See:
# http://code.google.com/p/freebase-site/source/browse/COPYING

# let's hope your on python 2.7 which has
# unitest class level setup
if sys.version.startswith('2.7'):
  import unittest
else:
  try:
    import unittest2 as unittest
  except ImportError:
    raise FbTestException(
      'you need to either install python 2.7, or install' +
      ' unittest2 with easy_install'
    )

logging.basicConfig(level=logging.INFO)
log = logging.getLogger('tst')


class FbTestCase(unittest.TestCase):
  """Base test class for freebase site web tests.

     By default a group of tests sets up (setUpClass) by starting
     a selenium browser instance and tears down (tearDownClass)
     by quiting the browser. If you want to do more setup
     you can override these classmethods. e.g.

     @classmethod
     def setUpClass(cls):
       super(TestClass, cls).setUpClass()
       cls.page = topic_page.TopicPage(cls.driver)
       cls.page.sign_in()

     If you want to do setup for each test override setUp
     tearDown (which are not classmethods)

     Using @classmethod's due to the way unittest works: 
     if you want setup that happens only once before a 
     set of tests (usually in a single file) run, you 
     do it at the class level.

  """

  # override these if you want per-test pre setup, post teardown

  def setUp(self):
    pass

  def tearDown(self):
    pass

  @classmethod
  def setUpClass(cls):
    cls.start_browser()

  @classmethod
  def tearDownClass(cls):
    cls.quit_browser()

  @classmethod
  def quit_browser(cls):
    if cls.driver is not None:
      starttime = time.time()
      cls.driver.quit()
      cls.driver = None
      elapsed = time.time() - starttime
      # TODO: figure out why chrome hangs for 30s, occasionally
      if elapsed > 5:
        log.warning('took %s seconds to quit_browser()' % elapsed)

  @classmethod
  def _process_kwargs(cls):
    # cls.browser and cls.selenium_rh are passed in by the unittest runner
    cls.browser = 'chrome'
    cls.selenium_rh = None
    if hasattr(cls, 'testrunner_kwargs'):
      cls.browser = cls.testrunner_kwargs.get('browser')
      cls.selenium_rh = cls.testrunner_kwargs.get('selenium_rh')

  @classmethod
  def start_browser(cls):
    log.info('start_browser')
    cls._process_kwargs()
    if cls.browser == 'chrome':
      cap = webdriver.DesiredCapabilities.CHROME
      # local acre has no cert, ignore
      cap['chrome.switches'] = ["--ignore-certificate-errors"]
      if cls.selenium_rh:
        cls.driver = webdriver.Remote(cls.selenium_rh, cap)
      else:
        cls.driver = webdriver.Chrome()
    elif cls.browser == 'firefox':
      cap = webdriver.DesiredCapabilities.FIREFOX
      if cls.selenium_rh:
        cls.driver = webdriver.Remote(cls.selenium_rh, cap)
      else:
        cls.driver = webdriver.Firefox()
    else:
      raise FbTestException('no valid --browser provided %s' % cls.browser)

  def refresh_browser(cls):
    cls.driver.refresh()

  def gen_dynstring(self):
    """a semi-random string to add database object names."""
    # a timestamp plus something semi random
    return '%s.%s' % (time.strftime('%m%d%H%M%S', (time.localtime())),
      random.randint(1, 100000))

