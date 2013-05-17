var METADATA = {
  "mounts": {
    "lib": "//132a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "83", 
  "app_tag": "83a", 
  "app_key": "mdo"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
