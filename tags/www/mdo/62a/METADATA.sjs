var METADATA = {
  "mounts": {
    "lib": "//111a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "62", 
  "app_tag": "62a", 
  "app_key": "mdo"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
