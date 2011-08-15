var METADATA = {
  "mounts": {
    "site": "//12a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "8", 
  "app_tag": "8a", 
  "app_key": "history"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");