
import time
from base_test import FbTestCase
from create_topic_page import FbCreateTopicPage
from google_accounts_page import GoogleAccountsPage
from selenium import webdriver

# Copyright 2012, Google Inc.
# Licensed under the BSD 3-Clause License. See:
# http://code.google.com/p/freebase-site/source/browse/COPYING

class TestClass(FbTestCase):
  
  @classmethod
  def setUpClass(cls):
    pass

  @classmethod
  def tearDownClass(cls):
    pass

  def setUp(self):
    # bring up a new browser before every test
    super(TestClass, self).setUpClass()
    self.page = FbCreateTopicPage(self.driver)
    self.this_type = '/user/daepark/default_domain/test_type'
    self.dynstring = self.gen_dynstring()
    self.g_page = GoogleAccountsPage(self.driver)

  def tearDown(self):
    super(TestClass, self).tearDownClass()

  def test_create_topic_fully_signed_out(self):
    self.page.nav_to_page(self.this_type)
    # we should now be redir. to google accounts page
    self.page.wait_for_text_in_url('accounts.google.com')
    self.g_page.google_login_password()
    # we should now be back at the create topic page
    self.page.wait_for_text_in_url(self.this_type)
    self.page.assert_signed_in()

  def test_create_topic_fb_signed_out(self):
    self.g_page.google_sign_in()
    topic_mid=self.page.create_topic(self.this_type, 
      'testtopic_%s' % self.dynstring)
    # we should *not* be redir. to google accounts page
    # we should now be back at the original url
    self.page.wait_for_text_in_url(topic_mid)
    self.page.assert_signed_in()

   
    
