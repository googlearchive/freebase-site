var METADATA = {
  "mounts": {
    "lib": "//137a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "38", 
  "app_tag": "38a", 
  "app_key": "search"
};

acre.require(METADATA.mounts.lib +
             "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
