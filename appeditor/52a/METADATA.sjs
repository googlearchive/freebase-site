var METADATA = {
  "mounts": {
    "lib": "//78a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "52", 
  "app_tag": "52a", 
  "app_key": "appeditor"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
