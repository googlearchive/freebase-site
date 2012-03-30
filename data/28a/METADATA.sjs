var METADATA = {
  "mounts": {
    "site": "//27b.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "28", 
  "app_tag": "28a", 
  "app_key": "data"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
