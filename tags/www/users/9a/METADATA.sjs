var METADATA = {
  "mounts": {
    "site": "//28b.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "9", 
  "app_tag": "9a", 
  "app_key": "users"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
