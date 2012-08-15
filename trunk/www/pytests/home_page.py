
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

class FbHomePage(FbBasePage):
  """home page test class for freebase-site web tests.

     see base_page.FbBasePage

  """

  pass

