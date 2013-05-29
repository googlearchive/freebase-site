var METADATA = {
  "mounts": {
    "lib": "//133a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "34", 
  "app_tag": "34a", 
  "app_key": "search"
};

acre.require(METADATA.mounts.lib +
             "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
