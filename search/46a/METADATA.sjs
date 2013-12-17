var METADATA = {
  "mounts": {
    "lib": "//145a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "46", 
  "app_tag": "46a", 
  "app_key": "search"
};

acre.require(METADATA.mounts.lib +
             "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
