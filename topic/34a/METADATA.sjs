var METADATA = {
  "mounts": {
    "site": "//27b.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "34", 
  "app_tag": "34a", 
  "app_key": "topic"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
