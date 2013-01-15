var METADATA = {
  "mounts": {
    "lib": "//101a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "52", 
  "app_tag": "52a", 
  "app_key": "mdo"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
