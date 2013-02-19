var METADATA = {
  "mounts": {
    "lib": "//109a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "60", 
  "app_tag": "60a", 
  "app_key": "mdo"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
