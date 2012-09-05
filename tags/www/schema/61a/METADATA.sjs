var METADATA = {
  "mounts": {
    "lib": "//82a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "61", 
  "app_tag": "61a", 
  "app_key": "schema"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
