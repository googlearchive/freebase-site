var METADATA = {
  "mounts": {
    "lib": "//91a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "63", 
  "app_tag": "63a", 
  "app_key": "sample"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
