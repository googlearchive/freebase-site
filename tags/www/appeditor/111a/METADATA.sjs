var METADATA = {
  "mounts": {
    "lib": "//137a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "111", 
  "app_tag": "111a", 
  "app_key": "appeditor"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
