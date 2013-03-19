var METADATA = {
  "mounts": {
    "lib": "//121a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "95", 
  "app_tag": "95a", 
  "app_key": "appeditor"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
