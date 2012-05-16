var METADATA = {
  "mounts": {
    "site": "//29a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "29", 
  "app_tag": "29a", 
  "app_key": "create"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
