
import base_page
import logging
import utils

# Copyright 2012, Google Inc.
# Licensed under the BSD 3-Clause License. See:
# http://code.google.com/p/freebase-site/source/browse/COPYING

FbCfg = utils.FbCfg
handle_fb_error = utils.handle_fb_error
retry = utils.retry
FbBasePage = base_page.FbBasePage

logging.basicConfig(level=logging.INFO)
log = logging.getLogger('tst')

class FbTopicPage(FbBasePage):
  """Topic page test class for freebase-site web tests.

     see base_page.FbBasePage

  """
 
  def assert_incompatible_type_msg(self, msg):
    """manage type, add type, incompatible."""
    incompat_element = self._get_incompatible_topic()
    self._wait_for_text_in_element(msg, incompat_element)

  def assert_add_type_success_msg(self):
    """manage type, add type, success."""
    self._web_driver_wait().until(
      lambda driver: driver.find_element_by_class_name('add-type-result-msg')
    )
    result = self.driver.find_element_by_class_name('add-type-result-msg')
    assert result.text == 'Type added successfully!'

  def add_type(self, input_val, i=0):
    """manage type, add a type.
       inputi_val - what to type in the fields
       i - which item to choose from suggest (default 1st)
    """
    dropdown = self.driver.find_element_by_class_name('manage-type-icon')
    dropdown.click()
    addinput = self.driver.find_element_by_id('add-type-input')
    self._web_driver_wait(driver=addinput).until(
      lambda driver: driver.is_displayed()
    )
    addinput.send_keys(input_val)
    self._wait_for_suggest()
    items = self.driver.find_elements_by_class_name('fbs-item')
    if len(items) < i+1:
      raise AssertionError('you asked for index %s of the suggest' % i +\
        ' list but that is out of range')
    items[i].click()

  def edit_prop_val(self, prop_id, input_val, index=0):
    """clicks the edit link on a prop, by default the first in the list."""
    data_section = self._get_property_data_section(prop_id)
    data_row = self._get_property_data_row(data_section, index)
    self._scroll_point_click(data_row.find_element_by_tag_name('a'))
    edit_row = self._get_property_edit_row(data_section, index)
    self._clear_and_type_fb_input(edit_row, input_val)
    self._click_save_fb_input(data_section)
    self._wait_for_prop_val(prop_id, index)

  def _wait_for_prop_val(self, prop_id, index=0):
    """after editing, wait for a val to show up."""
    # TODO: what changes when the input appears in the dom?
    pass

  def get_prop_val(self, prop_id, index=0):
    """returns the val for a prop, by default the first in the list."""
    data_section = self._get_property_data_section(prop_id)
    data_row = self._get_property_data_row(data_section, index)
    return data_row.find_elements_by_class_name('property-value')[index].text

  def add_new_prop_val(self, prop_id, input_val):
    """add a value for a given prop_id."""
    self._click_prop_menu_add_new(prop_id)
    self._input_prop_val(prop_id, input_val)
 
  def _get_incompatible_topic(self):
    """manage type, return the incompatible type element."""
    self._web_driver_wait().until(
      lambda driver: driver.find_element_by_class_name('incompatible-topic')
    )
    return self.driver.find_element_by_class_name('incompatible-topic')

  def _get_property_data_row(self, data_section, index):
    """return the element for one of the property values in a list."""
    return data_section.find_elements_by_class_name('data-row')[index]

  def _get_property_edit_row(self, data_section, index):
    """return the element for one of the property values in a list."""
    # edit-rows's show up async after you edit a prop val
    self._web_driver_wait(driver=data_section).until(
      lambda driver: driver.find_elements_by_class_name('edit-row')
    )
    return data_section.find_elements_by_class_name('edit-row')[index]

  def _get_property_data_section(self, prop_id):
    """return the element containing all the property vals for a prop_id."""
    prop_section = self._get_property_section(prop_id)
    data_section = prop_section.find_element_by_class_name('data-section')
    return data_section

  def _get_property_section(self, prop_id):
    """return the property section for a given prop_id."""
    prop_section = self.driver.find_element_by_xpath("//div[@data-id='%s']" % prop_id)
    return prop_section

  def _click_prop_menu_link(self, prop_id, index):
    """bring up the headmenu for a given prop_id, click an item."""
    prop_section = self._get_property_section(prop_id)
    headmenu = prop_section.find_element_by_class_name('headmenu')
    proplink = headmenu.find_element_by_tag_name('a')
    self._scroll_point_click(proplink)
    # TODO: add a class label to the edit context menu please!
    last_ul = self.driver.find_elements_by_tag_name('ul')[-1]
    rows = last_ul.find_elements_by_class_name('row-menu-item')
    clicklink = rows[index].find_element_by_tag_name('a')
    clicklink.click()

  def _click_prop_menu_add_new(self, prop_id):
    """click the add new item on the property headmenu."""
    self._click_prop_menu_link(prop_id, 0)

  def _input_prop_val(self, prop_id, input_val):
    """inputs a prop val, assumes that only one prop input is present."""
    # TODO: handle the case where multiple input fields are present.
    data_section = self._get_property_data_section(prop_id)
    self._clear_and_type_fb_input(data_section, input_val)
    self._click_save_fb_input(data_section)
    
