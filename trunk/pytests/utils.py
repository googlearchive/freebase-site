
import logging
import os
import re
import sys
import time

# Copyright 2012, Google Inc.
# Licensed under the BSD 3-Clause License. See:
# http://code.google.com/p/freebase-site/source/browse/COPYING

logging.basicConfig(level=logging.INFO)
log = logging.getLogger('tst')

class FbTestException(Exception):
  pass

def get_env(var, or_die=True):
  val = os.environ.get(var)
  if or_die:
    if val is None: 
      raise FbTestException('you must have %s in your environment/private.conf' % var)
  return val


class FbCfg:
  """map freebase env vars for use by test driver."""
  FB_UID = get_env('FSTEST_FB_UID') # fb uid displayed in the ui 
  LOGIN = get_env('FSTEST_UNAME') # test google user
  PASSWORD = get_env('FSTEST_PASSWD') # test google user password
  site_addr = get_env('ACRE_FREEBASE_SITE_ADDR')
  if '.freebase.com' in site_addr:
    raise FbTestException(
      'Not a good idea to run tests against freebase.com: ' +
      'ACRE_FREEBASE_SITE_ADDR=%s' % site_addr
      )
  SITE_ADDR = 'http://' + site_addr
  SSL_SITE_ADDR = 'https://' + site_addr
  # when using scrollTo, make sure you're in view
  HEADER_OFFSET = 200
  # for finding a mid
  MID_RE = re.compile('(\/m\/[^\/?]+)')
  COOKIE_DOMAIN = '.sandbox-freebase.com' # TODO: from env?
  TIMEOUTS = {
     # different scenarios require different waiting profiles
     # for _web_driver_wait method
     # name : (timeout_in_seconds, polling_interval)
    'default': (15, .1), # ajax-y things to load
    'long': (45, .5), # pages to load, e.g. redirects
    'short': (5, .05) # javascript to execute in browser
  }

def handle_fb_error():
  """decorator that looks for an status-msg.
    It only works with class or instance methods.
    (it needs self/cls to drive the browser)
    Wrap this around methods that do ajax-y fb-edit-y stuff
    and it will find the error message if it occurs.

    Why not just put the few lines of code in tearDown?
    We want this cause of failure in the test results.
    Once in tearDown it's too late to update the cause
    of failure.

    raises AssertionError with good info, else the original.
  """
  def deco_handle(f):
    def f_handle(*args, **kwargs):
      self = args[0]
      try:
        return f(*args, **kwargs)
      except:
        this_exception = sys.exc_info()
        status_msg = None
        try:
          # don't wait long, the status msg should be there already
          self.driver.implicitly_wait(1)
          status_msg=self.driver.find_element_by_class_name('status-msg')
          raise AssertionError('found fb status-msg: %s' % status_msg.text)
        except:
          # if it has info, re-raise
          if status_msg:
            if len(status_msg.text) > 0:
              raise
          # we didn't find a status_msg, just re-raise the original
          raise this_exception[1], None, this_exception[2]
    return f_handle
  return deco_handle

def retry(exception_to_check=AssertionError, tries=100, delay=.1):
  """decorator that retries on exception_to_check.
    exception_to_check - retry if this is caught
    tries - times to retry
    delay - sleep time between tries

    Returns whatever the wrapped function returns.
    Retries if exception_to_check is caught, others are raised.
    After last try in tries, raise exception_to_check.

    We're using this as a kind of advanced WedDriverWait
    in cases where we need to poll a more advanced set of steps
    than just webdriver calls.

  """
  def deco_retry(f):
    def f_retry(*args, **kwargs):
      mtries, mdelay = tries, delay
      while mtries > 0:
        try:
          return f(*args, **kwargs)
        except exception_to_check, e:
          log.info('%s, Retrying in %s seconds...' % (str(e), mdelay))
          time.sleep(mdelay)
          mtries -= 1
      try_time = float(tries*delay)
      raise exception_to_check('tried for %1.1f seconds, gave up' % try_time)
    return f_retry
  return deco_retry
