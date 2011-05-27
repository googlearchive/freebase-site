var METADATA = {
  "mounts": {
    "lib": "//12a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 2, 
  "app_tag": "2a", 
  "app_key": "appeditor"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);