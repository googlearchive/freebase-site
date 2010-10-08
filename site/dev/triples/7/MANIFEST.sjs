var mf = JSON.parse(acre.require("CONFIG.json").body);

acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/triples/fa4cab1d3a6af7c873abdff6f9a19ebe", "static_base_url": "http://freebaselibs.com/static/freebase_site/triples/fa4cab1d3a6af7c873abdff6f9a19ebe"});
