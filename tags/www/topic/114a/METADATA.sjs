var METADATA = {
  "mounts": {
    "lib": "//138a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "114", 
  "app_tag": "114a", 
  "app_key": "topic"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
