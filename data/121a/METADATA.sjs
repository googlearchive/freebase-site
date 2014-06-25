var METADATA = {
  "mounts": {
    "lib": "//150a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "121", 
  "app_tag": "121a", 
  "app_key": "data"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
