var METADATA = {
  "mounts": {
    "lib": "//139a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "117", 
  "app_tag": "117a", 
  "app_key": "schema"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
