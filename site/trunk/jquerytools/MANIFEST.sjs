/**
 * jquery tools 1.2.3
 * http://flowplayer.org/tools/
 */
var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this);
