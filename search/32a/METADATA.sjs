var METADATA = {
  "mounts": {
    "lib": "//131a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "32", 
  "app_tag": "32a", 
  "app_key": "search"
};

acre.require(METADATA.mounts.lib +
             "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
