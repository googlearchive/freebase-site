

from base_test import FbTestCase
from data_helpers import FbDataHelpers
from selenium import webdriver
from topic_page import FbTopicPage

# Copyright 2012, Google Inc.
# Licensed under the BSD 3-Clause License. See:
# http://code.google.com/p/freebase-site/source/browse/COPYING

class TestClass(FbTestCase):
 
  @classmethod
  def setUpClass(cls):
    super(TestClass, cls).setUpClass()
    cls.page = FbTopicPage(cls.driver)
    try:
      cls.page.sign_in()
    except:
      cls.quit_browser()
      raise

  def setUp(self):
    super(TestClass, self).setUp()
    self.dynstring = self.gen_dynstring()
    self.topic_name = 'testtopic_%s' % self.dynstring
    self.test_helper = FbDataHelpers(self.driver)
    self.topic_mid = self.test_helper.create_test_topic(self.topic_name)
    self.page.nav_to_page(self.topic_mid)

  def test_add_incomp_type(self):
    self.page.add_type('/location/location')
    self.page.assert_add_type_success_msg()
    self.page.nav_to_page(self.topic_mid)
    self.page.add_type('/people/person')
    self.page.assert_incompatible_type_msg(self.topic_name)