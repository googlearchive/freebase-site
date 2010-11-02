var mf = JSON.parse(acre.require("CONFIG.json").body);



acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/triples/285094bce2cbd1825ec2bbb88367e558", "static_base_url": "http://freebaselibs.com/static/freebase_site/triples/285094bce2cbd1825ec2bbb88367e558"});
