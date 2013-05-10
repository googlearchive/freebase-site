var METADATA = {
  "mounts": {
    "lib": "//131a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "109", 
  "app_tag": "109a", 
  "app_key": "schema"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
