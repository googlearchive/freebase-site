var METADATA = {
  "mounts": {
    "lib": "//102a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "3", 
  "app_tag": "3a", 
  "app_key": "search"
};

acre.require(METADATA.mounts.lib +
             "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
