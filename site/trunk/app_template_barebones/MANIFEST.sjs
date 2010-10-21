var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.manifest + "/MANIFEST").init(this, config);
