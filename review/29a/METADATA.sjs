var METADATA = {
  "mounts": {
    "site": "//46b.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "29", 
  "app_tag": "29a", 
  "app_key": "review"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
