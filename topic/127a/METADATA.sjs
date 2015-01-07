var METADATA = {
  "mounts": {
    "lib": "//152a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "127", 
  "app_tag": "127a", 
  "app_key": "topic"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
