var METADATA = {
  "mounts": {
    "lib": "//103a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "81", 
  "app_tag": "81a", 
  "app_key": "schema"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
