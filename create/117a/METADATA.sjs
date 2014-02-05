var METADATA = {
  "mounts": {
    "lib": "//147a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "117", 
  "app_tag": "117a", 
  "app_key": "create"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
