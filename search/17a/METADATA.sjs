var METADATA = {
  "mounts": {
    "lib": "//116a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "17", 
  "app_tag": "17a", 
  "app_key": "search"
};

acre.require(METADATA.mounts.lib +
             "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
