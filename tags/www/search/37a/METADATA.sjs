var METADATA = {
  "mounts": {
    "lib": "//136a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "37", 
  "app_tag": "37a", 
  "app_key": "search"
};

acre.require(METADATA.mounts.lib +
             "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
