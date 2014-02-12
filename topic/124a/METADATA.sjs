var METADATA = {
  "mounts": {
    "lib": "//148a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "124", 
  "app_tag": "124a", 
  "app_key": "topic"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
