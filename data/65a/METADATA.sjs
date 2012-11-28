var METADATA = {
  "mounts": {
    "lib": "//94a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "65", 
  "app_tag": "65a", 
  "app_key": "data"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
