var METADATA = {
  "mounts": {
    "lib": "//146a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "118", 
  "app_tag": "118a", 
  "app_key": "sample"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
