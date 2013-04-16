var METADATA = {
  "mounts": {
    "lib": "//129a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "107", 
  "app_tag": "107a", 
  "app_key": "schema"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
