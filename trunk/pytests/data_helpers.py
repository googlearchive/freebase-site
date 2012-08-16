
import create_topic_page
import logging
import utils

# Copyright 2012, Google Inc.
# Licensed under the BSD 3-Clause License. See:
# http://code.google.com/p/freebase-site/source/browse/COPYING

FbCreateTopicPage = create_topic_page.FbCreateTopicPage

logging.basicConfig(level=logging.INFO)
log = logging.getLogger('tst')

class FbDataHelpers:
  """Methods to create test data.

     This could include creating data using
     the UI, but ideally should migrate toward
     making mql calls directly or at least hitting
     some acre utility scripts that do writes.

  """

  def __init__(self, driver=None):
    self.driver = driver
    self.test_type = '/user/daepark/default_domain/test_type'

  def create_test_topic(self, topic_name):
    """creates a topic of type type_id."""
    page = FbCreateTopicPage(self.driver)
    page = FbCreateTopicPage(self.driver)
    return page.create_topic(self.test_type, topic_name)
    
