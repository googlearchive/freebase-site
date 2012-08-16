
import pdb
import time
import utils
from base_test import FbTestCase
from home_page import FbHomePage
from google_accounts_page import GoogleAccountsPage
from selenium import webdriver

# Copyright 2012, Google Inc.
# Licensed under the BSD 3-Clause License. See:
# http://code.google.com/p/freebase-site/source/browse/COPYING

FbCfg = utils.FbCfg

class TestClass(FbTestCase):
  
  @classmethod
  def setUpClass(cls):
    pass

  @classmethod
  def tearDownClass(cls):
    pass

  def setUp(self):
    # bring up a new browser for every test
    super(TestClass, self).setUpClass()
    self.home_page = FbHomePage(self.driver)
    self.g_page = GoogleAccountsPage(self.driver)
    self.you_url = FbCfg.SSL_SITE_ADDR + FbCfg.FB_UID

  def tearDown(self):
    super(TestClass, self).tearDownClass()

  def test_signin_clean(self):
    '''login directly from freebase.com'''
    
    self.home_page.nav_to_page()
    self.home_page.assert_signed_out()
    self.home_page.click_sign_in()
    # should go to google sign in then redirect back to fb
    self.g_page.wait_for_text_in_url('accounts.google.com')
    self.g_page.google_login_password()
    # should be at user's home page
    self.home_page.wait_for_text_in_url(FbCfg.FB_UID)
    self.home_page.assert_signed_in()
    self.assertEquals(self.you_url, self.home_page.get_you_url())

  def test_signin_already_gaia(self):
    '''If you're logged in via gaia, fb signin should automatically sign in
       as the correct linked user.
    '''
    # gaia login first
    self.g_page.google_sign_in()

    # now go to fb site
    self.home_page.nav_to_page()
    self.home_page.assert_signed_out()
    self.home_page.click_sign_in()
    self.home_page.assert_signed_in()
    self.assertEquals(self.you_url, self.home_page.get_you_url())


