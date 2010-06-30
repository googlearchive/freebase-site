/**
 * jquery-ui 1.8.2 (Stable, for jQuery 1.4+)
 * http://jqueryui.com/
 */
var MF = {
  "apps": {
    "core": "//5.core.site.freebase.dev"
  },
  "javascript": {
    "jquery.ui.core.mf.js": ["jquery.ui.core.js", "jquery.ui.widget.js", "jquery.ui.mouse.js", "jquery.ui.position.js"]
  }
};

acre.require(MF.apps.core + "/MANIFEST").init(MF, this);
