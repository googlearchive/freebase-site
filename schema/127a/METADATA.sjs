var METADATA = {
  "mounts": {
    "lib": "//149a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "127", 
  "app_tag": "127a", 
  "app_key": "schema"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
