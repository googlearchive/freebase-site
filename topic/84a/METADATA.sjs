var METADATA = {
  "mounts": {
    "lib": "//108a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "84", 
  "app_tag": "84a", 
  "app_key": "topic"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
