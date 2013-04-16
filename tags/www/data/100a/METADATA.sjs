var METADATA = {
  "mounts": {
    "lib": "//129a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "100", 
  "app_tag": "100a", 
  "app_key": "data"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
