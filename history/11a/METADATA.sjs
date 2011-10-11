var METADATA = {
  "mounts": {
    "site": "//16a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "11", 
  "app_tag": "11a", 
  "app_key": "history"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");