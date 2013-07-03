var METADATA = {
  "mounts": {
    "lib": "//138a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "116", 
  "app_tag": "116a", 
  "app_key": "schema"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
