var METADATA = {
  "mounts": {
    "lib": "//146a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "47", 
  "app_tag": "47a", 
  "app_key": "search"
};

acre.require(METADATA.mounts.lib +
             "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
