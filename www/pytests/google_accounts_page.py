
import logging
import utils
from page import Page

# Copyright 2012, Google Inc.
# Licensed under the BSD 3-Clause License. See:
# http://code.google.com/p/freebase-site/source/browse/COPYING

FbCfg = utils.FbCfg
logging.basicConfig(level=logging.INFO)
log = logging.getLogger('tst')

class GoogleAccountsPage(Page):
  """Google signin page test class for freebase-site web tests.

     see base_page.FbBasePage

  """

  def google_sign_out(self):
    log.info('google_sign_out')
    self.driver.get('https://www.google.com/accounts/Logout')

  def google_sign_in(self):
    self.driver.get('https://accounts.google.com/Login')
    self.google_login_password()

  def google_login_password(self, login=None, password=None):
    d = self.driver
    uname = d.find_element_by_id('Email')
    pwd = d.find_element_by_id('Passwd')
    uname.clear()
    if login is None: login = FbCfg.LOGIN
    uname.send_keys(login)
    if password is None: password = FbCfg.PASSWORD
    if password is None:
      raise FbBasePageException('you must provide a password')
    pwd.send_keys(password)
    signin = d.find_element_by_class_name('g-button-submit')
    signin.click()

