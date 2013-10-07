var METADATA = {
  "mounts": {
    "lib": "//144a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "120", 
  "app_tag": "120a", 
  "app_key": "topic"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
