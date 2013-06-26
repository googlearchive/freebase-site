var METADATA = {
  "mounts": {
    "lib": "//136a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "87", 
  "app_tag": "87a", 
  "app_key": "mdo"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
