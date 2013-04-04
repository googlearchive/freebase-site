var METADATA = {
  "mounts": {
    "lib": "//126a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "102", 
  "app_tag": "102a", 
  "app_key": "topic"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
