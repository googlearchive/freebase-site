var METADATA = {
  "mounts": {
    "lib": "//126a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "76", 
  "app_tag": "76a", 
  "app_key": "users"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
