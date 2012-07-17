var METADATA = {
  "mounts": {
    "site": "//39a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "47a", 
  "app_version": "47", 
  "app_key": "topic"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
