var METADATA = {
  "mounts": {
    "lib": "//109a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "61", 
  "app_tag": "61a", 
  "app_key": "review"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
