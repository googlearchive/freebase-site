var METADATA = {
  "mounts": {
    "lib": "//103a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "54", 
  "app_tag": "54a", 
  "app_key": "mdo"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
