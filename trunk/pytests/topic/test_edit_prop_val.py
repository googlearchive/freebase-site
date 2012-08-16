
import random
from base_test import FbTestCase
from data_helpers import FbDataHelpers
from topic_page import FbTopicPage
from selenium import webdriver

# Copyright 2012, Google Inc.
# Licensed under the BSD 3-Clause License. See:
# http://code.google.com/p/freebase-site/source/browse/COPYING

class TestClass(FbTestCase):
  
  @classmethod
  def setUpClass(cls):
    super(TestClass, cls).setUpClass()
    cls.topic_mid = None
    cls.page = FbTopicPage(cls.driver)
    # any complex setup needs to be wrapped in a try
    # so as not to leave stray browsers running
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

  def test_edit_decimal(self):
    mid = self.topic_mid
    input_val = '123.%s' % random.randint(1,1000)
    input_val = input_val.rstrip('0')
    prop_id = self.this_type + '/float'
    self.page.add_new_prop_val(prop_id, input_val)
    self.refresh_browser()
    self.assertEquals(self.page.get_prop_val(prop_id), input_val)

    # now change it
    input_val = '123.%s' % random.randint(1,1000)
    input_val = input_val.rstrip('0')
    self.page.edit_prop_val(prop_id, input_val)
    current_val = self.page.get_prop_val(prop_id)
    # TODO: verify in dom
    #self.assertEquals(self.page.get_prop_val(prop_id), input_val)   
    self.refresh_browser()
    self.assertEquals(self.page.get_prop_val(prop_id), input_val)