var METADATA = {
  "mounts": {
    "lib": "//122c.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "93", 
  "app_tag": "93b", 
  "app_key": "data"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
