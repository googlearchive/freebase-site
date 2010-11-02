/**
 * jquery-ui 1.8.4 (Stable, for jQuery 1.4+)
 * http://jqueryui.com/
 */
var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this);
