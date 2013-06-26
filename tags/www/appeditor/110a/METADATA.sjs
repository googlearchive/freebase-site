var METADATA = {
  "mounts": {
    "lib": "//136a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "110", 
  "app_tag": "110a", 
  "app_key": "appeditor"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
