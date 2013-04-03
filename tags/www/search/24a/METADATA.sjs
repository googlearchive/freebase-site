var METADATA = {
  "mounts": {
    "lib": "//123a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "24", 
  "app_tag": "24a", 
  "app_key": "search"
};

acre.require(METADATA.mounts.lib +
             "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
