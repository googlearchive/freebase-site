var METADATA = {
  "mounts": {
    "site": "//41a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "22", 
  "app_tag": "22a", 
  "app_key": "users"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
