var METADATA = {
  "mounts": {
    "lib": "//96a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "72", 
  "app_tag": "72a", 
  "app_key": "topic"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
