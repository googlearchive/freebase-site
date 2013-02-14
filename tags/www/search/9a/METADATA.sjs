var METADATA = {
  "mounts": {
    "lib": "//108a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "9", 
  "app_tag": "9a", 
  "app_key": "search"
};

acre.require(METADATA.mounts.lib +
             "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
