var METADATA = {
  "mounts": {
    "lib": "//84a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "58", 
  "app_tag": "58a", 
  "app_key": "appeditor"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
