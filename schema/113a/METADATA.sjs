var METADATA = {
  "mounts": {
    "lib": "//135a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "113", 
  "app_tag": "113a", 
  "app_key": "schema"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
