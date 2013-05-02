var METADATA = {
  "mounts": {
    "lib": "//130a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "100", 
  "app_tag": "100a", 
  "app_key": "query"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
