var METADATA = {
  "mounts": {
    "lib": "//126a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "97", 
  "app_tag": "97a", 
  "app_key": "data"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
