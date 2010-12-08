var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config);
/**
 * jquery tools 1.2.3
 * http://flowplayer.org/tools/
 */
