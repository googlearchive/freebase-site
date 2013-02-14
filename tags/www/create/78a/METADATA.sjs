var METADATA = {
  "mounts": {
    "lib": "//108a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "78", 
  "app_tag": "78a", 
  "app_key": "create"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
