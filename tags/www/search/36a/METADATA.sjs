var METADATA = {
  "mounts": {
    "lib": "//135a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "36", 
  "app_tag": "36a", 
  "app_key": "search"
};

acre.require(METADATA.mounts.lib +
             "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
