var METADATA = {
  "mounts": {
    "lib": "//88a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "39", 
  "app_tag": "39a", 
  "app_key": "users"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
