var METADATA = {
  "mounts": {
    "lib": "//145a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "116", 
  "app_tag": "116a", 
  "app_key": "data"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
