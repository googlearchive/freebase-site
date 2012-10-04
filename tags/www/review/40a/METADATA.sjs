var METADATA = {
  "mounts": {
    "lib": "//87a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "40", 
  "app_tag": "40a", 
  "app_key": "review"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
