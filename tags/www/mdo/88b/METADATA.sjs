var METADATA = {
  "mounts": {
    "lib": "//137b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "88", 
  "app_tag": "88b", 
  "app_key": "mdo"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
