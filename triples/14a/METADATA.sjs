var METADATA = {
  "mounts": {
    "site": "//10g.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "14", 
  "app_tag": "14a", 
  "app_key": "triples"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");