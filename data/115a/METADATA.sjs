var METADATA = {
  "mounts": {
    "lib": "//144a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "115", 
  "app_tag": "115a", 
  "app_key": "data"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
