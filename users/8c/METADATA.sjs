var METADATA = {
  "mounts": {
    "site": "//26d.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "8", 
  "app_tag": "8c", 
  "app_key": "users"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
