var METADATA = {
  "mounts": {
    "lib": "//94a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "46", 
  "app_tag": "46a", 
  "app_key": "review"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
