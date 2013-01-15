var METADATA = {
  "mounts": {
    "lib": "//100a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "1", 
  "app_tag": "1a", 
  "app_key": "search"
};

acre.require(METADATA.mounts.lib +
             "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
