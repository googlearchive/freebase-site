var METADATA = {
  "mounts": {
    "lib": "//139a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "89", 
  "app_tag": "89a", 
  "app_key": "users"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
