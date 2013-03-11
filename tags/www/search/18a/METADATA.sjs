var METADATA = {
  "mounts": {
    "lib": "//117a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "18", 
  "app_tag": "18a", 
  "app_key": "search"
};

acre.require(METADATA.mounts.lib +
             "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
