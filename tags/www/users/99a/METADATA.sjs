var METADATA = {
  "mounts": {
    "lib": "//149a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "99", 
  "app_tag": "99a", 
  "app_key": "users"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
