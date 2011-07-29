var METADATA = {
  "mounts": {
    "site": "//11a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "7", 
  "app_tag": "7a", 
  "app_key": "history"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");