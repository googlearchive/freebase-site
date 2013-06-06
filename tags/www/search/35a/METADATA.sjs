var METADATA = {
  "mounts": {
    "lib": "//134a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "35", 
  "app_tag": "35a", 
  "app_key": "search"
};

acre.require(METADATA.mounts.lib +
             "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
