var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config);
/**
 * jquery-ui 1.8.4 (Stable, for jQuery 1.4+)
 * http://jqueryui.com/
 */
