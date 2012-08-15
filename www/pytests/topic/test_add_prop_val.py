

from selenium import webdriver
from base_test import FbTestCase
from data_helpers import FbDataHelpers
from topic_page import FbTopicPage

# Copyright 2012, Google Inc.
# Licensed under the BSD 3-Clause License. See:
# http://code.google.com/p/freebase-site/source/browse/COPYING

class TestClass(FbTestCase):
  
  @classmethod
  def setUpClass(cls):
    super(TestClass, cls).setUpClass()
    cls.topic_mid = None
    cls.page = FbTopicPage(cls.driver)
    try:
      cls.page.sign_in()
    except:
      cls.quit_browser()
      raise

  def setUp(self):
    super(TestClass, self).setUp()
    self.dynstring = self.gen_dynstring()
    # TODO: to save time, we re-use one topic for all these tests
    # move this up to setUpClass if you want.
    if TestClass.topic_mid is None:
      self.topic_name = 'testtopic_%s' % self.dynstring
      self.test_helper = FbDataHelpers(self.driver)
      self.this_type = self.test_helper.test_type
      self.topic_mid = self.test_helper.create_test_topic(self.topic_name)
      topic_path = self.topic_mid + '?domains=all'
    # no need to load page if we're already there
    if not topic_path in self.driver.current_url:
      self.page.nav_to_page(topic_path)

  def test_add_txt(self):
    mid = self.topic_mid
    input_val = 'text_%s' % self.dynstring 
    prop_id = self.this_type + '/text'
    self.page.add_new_prop_val(prop_id, input_val)
    # TODO: verify in dom.
    #self.assertEquals(self.page.get_prop_val(prop_id), input_val)
    self.refresh_browser()
    self.assertEquals(self.page.get_prop_val(prop_id), input_val)

  def test_add_date(self):
    mid = self.topic_mid
    input_val = 'feb 2, 2012'
    expected_val = 'February 2, 2012'
    prop_id = self.this_type + '/date'
    self.page.add_new_prop_val(prop_id, input_val)
    #self.assertEquals(self.page.get_prop_val(prop_id), expected_val)
    self.refresh_browser()
    self.assertEquals(self.page.get_prop_val(prop_id), expected_val)
