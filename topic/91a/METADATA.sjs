var METADATA = {
  "mounts": {
    "lib": "//115a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "91", 
  "app_tag": "91a", 
  "app_key": "topic"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
