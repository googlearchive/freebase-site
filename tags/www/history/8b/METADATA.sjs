var METADATA = {
  "mounts": {
    "site": "//12b.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "8", 
  "app_tag": "8b", 
  "app_key": "history"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");