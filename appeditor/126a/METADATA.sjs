var METADATA = {
  "mounts": {
    "lib": "//155a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "126", 
  "app_tag": "126a", 
  "app_key": "appeditor"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
