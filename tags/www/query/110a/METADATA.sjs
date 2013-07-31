var METADATA = {
  "mounts": {
    "lib": "//140a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "110", 
  "app_tag": "110a", 
  "app_key": "query"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
