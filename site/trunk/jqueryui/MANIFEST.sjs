/**
 * jquery-ui 1.8.4 (Stable, for jQuery 1.4+)
 * http://jqueryui.com/
 */
var mf = {
  "apps": {
    "core": "//core.site.freebase.dev"
  },
  "javascript": {
    "jquery.ui.core.mf.js": ["jquery.ui.core.js", "jquery.ui.widget.js", "jquery.ui.mouse.js", "jquery.ui.position.js"]
  }
};

acre.require(mf.apps.core + "/MANIFEST").init(mf, this);
