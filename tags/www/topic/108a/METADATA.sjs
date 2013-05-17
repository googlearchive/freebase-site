var METADATA = {
  "mounts": {
    "lib": "//132a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "108", 
  "app_tag": "108a", 
  "app_key": "topic"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
