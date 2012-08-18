var METADATA = {
  "mounts": {
    "lib": "//76c.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "0a", 
  "app_version": "0", 
  "app_key": "test"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
