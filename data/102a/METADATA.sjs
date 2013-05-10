var METADATA = {
  "mounts": {
    "lib": "//131a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "102", 
  "app_tag": "102a", 
  "app_key": "data"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
