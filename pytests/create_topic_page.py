
import base_page
import logging
import utils

# Copyright 2012, Google Inc.
# Licensed under the BSD 3-Clause License. See:
# http://code.google.com/p/freebase-site/source/browse/COPYING

FbBasePage = base_page.FbBasePage

handle_fb_error = utils.handle_fb_error
retry = utils.retry
FbCfg = utils.FbCfg

logging.basicConfig(level=logging.INFO)
log = logging.getLogger('tst')

class FbCreateTopicPage(FbBasePage):
  """Create topic page test class for freebase-site web tests.

     see base_page.FbBasePage

  """

  def nav_to_page(self, type_id):
    """navigate to a topic creation page."""
    self.driver.get(FbCfg.SITE_ADDR + type_id + '?create')

  def create_topic(self, type_id, topic_name):
    """create a simple named topic for a type_id."""
    return self.create_complex_topic(type_id,
      {'/type/object/name':topic_name}
      )

  @handle_fb_error()
  def create_complex_topic(self, type_id, props):
    '''creates a topic of a given type.
       
       type_id: id of the type
       props: dictionary with property ids and desired vals
         e.g.
         {'/type/object/name': 'test location',
          '/location/location/containedby': '/en/san_francisco'}
    '''
    # TODO: support more than just a simple name
    # i.e. complex props
    self.nav_to_page(type_id)
    self._web_driver_wait().until(
      lambda driver: driver.find_element_by_class_name('edit-form')
    )    
    element = self.driver.find_element_by_class_name('edit-form')
    for k, v in props.iteritems():
      # TODO: handle the auto-suggest fields, this
      # only does simple datatypes
      input = element.find_element_by_xpath("//input[@name='%s']" % k)
      input.send_keys(v)
       
    self._click_save(element)
    # this causes a redirect, from which we can get the created mid
    self.wait_for_text_in_url('/m/')
    return self.find_mid(self.driver.current_url)
   

