var METADATA = {
  "mounts": {
    "lib": "//143a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "121", 
  "app_tag": "121a", 
  "app_key": "schema"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
