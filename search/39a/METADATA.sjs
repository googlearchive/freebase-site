var METADATA = {
  "mounts": {
    "lib": "//138a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "39", 
  "app_tag": "39a", 
  "app_key": "search"
};

acre.require(METADATA.mounts.lib +
             "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
