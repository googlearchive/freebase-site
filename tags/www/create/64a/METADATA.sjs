var METADATA = {
  "mounts": {
    "lib": "//94a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "64", 
  "app_tag": "64a", 
  "app_key": "create"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
