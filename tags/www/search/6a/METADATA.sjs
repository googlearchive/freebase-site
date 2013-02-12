var METADATA = {
  "mounts": {
    "lib": "//105b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "6", 
  "app_tag": "6a", 
  "app_key": "search"
};

acre.require(METADATA.mounts.lib +
             "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
