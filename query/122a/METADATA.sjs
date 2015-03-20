var METADATA = {
  "mounts": {
    "lib": "//155a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "122", 
  "app_tag": "122a", 
  "app_key": "query"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
