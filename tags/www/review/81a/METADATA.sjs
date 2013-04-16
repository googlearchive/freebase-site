var METADATA = {
  "mounts": {
    "lib": "//129a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "81", 
  "app_tag": "81a", 
  "app_key": "review"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
