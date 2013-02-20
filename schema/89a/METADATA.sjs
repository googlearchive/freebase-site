var METADATA = {
  "mounts": {
    "lib": "//111a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "89", 
  "app_tag": "89a", 
  "app_key": "schema"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
