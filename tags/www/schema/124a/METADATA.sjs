var METADATA = {
  "mounts": {
    "lib": "//146a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "124", 
  "app_tag": "124a", 
  "app_key": "schema"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
