var METADATA = {
  "mounts": {
    "lib": "//156b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "54", 
  "app_tag": "54a", 
  "app_key": "search"
};

acre.require(METADATA.mounts.lib +
             "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
