
from topic_page import FbTopicPage
from base_test import FbTestCase
import utils
import time
from selenium import webdriver
from unittest import skip

# Copyright 2012, Google Inc.
# Licensed under the BSD 3-Clause License. See:
# http://code.google.com/p/freebase-site/source/browse/COPYING

FbCfg = utils.FbCfg


class TestClass(FbTestCase):
  
  def test_redirect_en(self):
    key = '/en/sting'
    mid = '/m/0lbj1'
    page = FbTopicPage(self.driver)
    page.nav_to_page(key)
    page.wait_for_text_in_url(mid)
    self.assertIn(FbCfg.SITE_ADDR + mid, page.get_current_url())
    val=page.get_prop_val('/music/artist/origin')
    self.assertEquals(val, 'Wallsend')
     

    


