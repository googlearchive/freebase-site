var METADATA = {
  "mounts": {
    "lib": "//99a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "73", 
  "app_tag": "73a", 
  "app_key": "appeditor"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
