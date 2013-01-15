var METADATA = {
  "mounts": {
    "lib": "//101a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "2", 
  "app_tag": "2a", 
  "app_key": "search"
};

acre.require(METADATA.mounts.lib +
             "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
