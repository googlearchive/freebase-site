var METADATA = {
  "mounts": {
    "lib": "//113a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "14", 
  "app_tag": "14a", 
  "app_key": "search"
};

acre.require(METADATA.mounts.lib +
             "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
