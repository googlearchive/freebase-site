var METADATA = {
  "mounts": {
    "lib": "//79e.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "31", 
  "app_tag": "31a", 
  "app_key": "mdo"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
