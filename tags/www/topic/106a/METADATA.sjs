var METADATA = {
  "mounts": {
    "lib": "//130a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "106", 
  "app_tag": "106a", 
  "app_key": "topic"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
