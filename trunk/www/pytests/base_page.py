
import logging
import re
import utils
from page import Page
from google_accounts_page import GoogleAccountsPage
from selenium import webdriver

# Copyright 2012, Google Inc.
# Licensed under the BSD 3-Clause License. See:
# http://code.google.com/p/freebase-site/source/browse/COPYING

handle_fb_error = utils.handle_fb_error
retry = utils.retry
FbCfg = utils.FbCfg

logging.basicConfig(level=logging.INFO)
log = logging.getLogger('tst')

class FbBasePage(Page):
  """Base class for freebase site pages.

     this includes methods that are used in all Fb pages,
     page properties (such as the header and footer), 
     as well as stuff related to site signin/signout

  """

  def nav_to_page(self, path='', params={}, data=None, ssl=True):
    """navigate to a fb web page.
       args:
         path: path to add to url
         params: http url params to add to url
         data: POST data to include
    """
    # TODO: handle params and data
    if ssl:
      self.driver.get(FbCfg.SSL_SITE_ADDR + path)
    else:
      self.driver.get(FbCfg.SITE_ADDR + path)

  def find_mid(self, val):
    m = re.search(FbCfg.MID_RE, val)
    if m:
      return m.groups()[0]
    else:
      return None

  def _wait_for_suggest(self):
    self._web_driver_wait().until(
      lambda driver: driver.find_element_by_class_name('fbs-item').is_displayed()
    )

  @retry()
  def _wait_for_saved(self, data_section):
    """poll until an item in the list is 'current'."""
    # TODO: how to do this with _web_driver_wait
    # given that it's going through a list of things over and over
    dl = data_section.find_element_by_class_name('data-list')
    els = dl.find_elements_by_tag_name('li')
    for el in els:
      if 'current' in el.get_attribute('class'):
        return True
    else:
      raise AssertionError('data-list class still not set to current')

  def _scroll_point_click(self, element):
    '''scrolls the clickable element into view, mouses-over, clicks.'''
    edit_location = int(element.location['y'])-FbCfg.HEADER_OFFSET
    self.driver.execute_script("window.scrollTo(0, %s);" % edit_location)
    actor = webdriver.common.action_chains.ActionChains(self.driver)
    actor.move_to_element(element)
    actor.perform()
    self._web_driver_wait(driver=element).until(
      lambda driver: driver.is_displayed()
    )
    element.click()

  def _click_save(self, element):
    """looks for a and clicks save.
       element - the 'data-section' for a property
         pass
    """
    save =  element.find_element_by_class_name('save')
    self._web_driver_wait(driver=save).until(
      lambda driver: driver.get_attribute('disabled') is None
    )
    save.click()
 
  def _clear_and_type_fb_input(self, element, val):
    self._web_driver_wait(driver=element).until(
      lambda driver: driver.find_element_by_class_name('fb-input')
    )
    input_box = element.find_element_by_class_name('fb-input')
    input_box.clear()
    input_box.send_keys(val)

  @handle_fb_error()
  def _click_save_fb_input(self, element):
    self._click_save(element)
    self._wait_for_saved(element)
  
  def sign_out(self):
    log.info('sign_out')
    self.driver.get(FbCfg.SSL_SITE_ADDR + '/account/signout')

  def signed_in(self):
    """if the access_token cookie is there, you're in"""
    # TODO: is there a better way to do this?
    ret = False
    for c in self.driver.get_cookies():
      if c.get('domain') == FbCfg.COOKIE_DOMAIN:
        val = c.get('value')
        if val:
          if 'access_token' in val:
            log.info('signed_in is True %s' % val)
            ret = True
    return ret

  def sign_in(self):
    log.info('sign_in')
    if self.signed_in():
      log.info('already signed in')
      return True
    self.driver.get(FbCfg.SSL_SITE_ADDR + \
     '/account/signin?onsignin=' + \
     FbCfg.SSL_SITE_ADDR)
    page = GoogleAccountsPage(self.driver)
    self.wait_for_text_in_url('accounts.google.com')
    page.google_login_password()
    # back in freebase.com
    self.wait_for_text_in_url('freebase.com')

  def click_sign_in(self):
    signin_div = self.driver.find_element_by_id('signedout')
    signin_div.find_element_by_tag_name('a').click()

  @retry()
  def assert_signed_in(self):
    if self.signed_in() is True:
      return True
    else:
      raise AssertionError('not signed in')

  @retry()
  def assert_signed_out(self):
    if self.signed_in() is False:
      return True
    else:
      raise AssertionError('not signed out')

  def get_you_url(self):
    thumb = self.driver.find_element_by_class_name('user-thumb')
    return thumb.get_attribute('href')
