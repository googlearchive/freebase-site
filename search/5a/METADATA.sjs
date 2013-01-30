var METADATA = {
  "mounts": {
    "lib": "//104a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "5", 
  "app_tag": "5a", 
  "app_key": "search"
};

acre.require(METADATA.mounts.lib +
             "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
