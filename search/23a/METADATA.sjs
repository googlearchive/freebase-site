var METADATA = {
  "mounts": {
    "lib": "//122c.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "23", 
  "app_tag": "23a", 
  "app_key": "search"
};

acre.require(METADATA.mounts.lib +
             "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
