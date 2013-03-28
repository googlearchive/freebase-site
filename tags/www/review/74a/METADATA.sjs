var METADATA = {
  "mounts": {
    "lib": "//122c.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "74", 
  "app_tag": "74a", 
  "app_key": "review"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
