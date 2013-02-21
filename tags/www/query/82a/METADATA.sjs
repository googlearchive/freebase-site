var METADATA = {
  "mounts": {
    "lib": "//112a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "82", 
  "app_tag": "82a", 
  "app_key": "query"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
