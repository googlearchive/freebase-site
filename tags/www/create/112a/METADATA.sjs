var METADATA = {
  "mounts": {
    "lib": "//142a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "112", 
  "app_tag": "112a", 
  "app_key": "create"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
