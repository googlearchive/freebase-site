/**
 * jquery-ui 1.8.4 (Stable, for jQuery 1.4+)
 * http://jqueryui.com/
 */
var mf = {
  "apps": {
    "core": "//16.core.site.freebase.dev"
  },
  "javascript": {
    "jquery.ui.core.mf.js": ["jquery.ui.core.js", "jquery.ui.widget.js", "jquery.ui.mouse.js", "jquery.ui.position.js"]
  }
};

acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/jqueryui/826f5bf2fa6a570a0b7f4bc0a25867f5", "static_base_url": "http://freebaselibs.com/static/freebase_site/jqueryui/826f5bf2fa6a570a0b7f4bc0a25867f5"});
