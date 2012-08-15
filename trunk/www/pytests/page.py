
import utils
import selenium.webdriver.support.ui as ui

# Copyright 2012, Google Inc.
# Licensed under the BSD 3-Clause License. See:
# http://code.google.com/p/freebase-site/source/browse/COPYING

retry = utils.retry
FbCfg = utils.FbCfg

class Page:
  """Base class for all webdriven pages.

    This should *only* contain webdriver specific
    stuff (no fbsite stuff in here, for that FbBasePage)

    We use the PageObjects pattern to model fb site
    webpages:

    http://code.google.com/p/selenium/wiki/PageObjects

    methods returning other PageObjects is the one guideline
    we ignore.  It doesn't seem helpful.
  """

  def __init__(self, driver):
    # webdriver driver (presumably already running a browser)
    self.driver = driver


  def _wait_for_text_in_element(self, val, element):
    """the element is there, wait for the text val to show up."""
    self._web_driver_wait(driver=element).until(
      lambda driver: val in driver.text
    )

  def _wait_for_exact_text_in_element(self, val, element):
    """the element is there, wait for the text val to show up, exactly."""
    self._web_driver_wait(driver=element).until(
      lambda driver: val == driver.text
    )

  def wait_for_text_in_url(self, val):
    """some actions result in redirects, this waits for the url.
       use this instead of self.get_url which assumes the page 
       was already loaded.
    """
    self._web_driver_wait(policy='long').until(
      lambda driver: val in driver.current_url
    )

  def get_current_url(self):
    """wrapper, returns webdriver current_url."""
    return self.driver.current_url

  def _web_driver_wait(self, policy='default', driver=None):
    """returns a web driver wait object, with our timeout policy.
       policy - nickname for timeout and poll interval
       driver - the webdriver object that the wait lambda should use.
    """
    if driver is None: driver = self.driver
    (timeout, poll_interval) = FbCfg.TIMEOUTS.get(policy)
    return ui.WebDriverWait(driver, timeout, poll_interval)

