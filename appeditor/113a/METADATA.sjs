var METADATA = {
  "mounts": {
    "lib": "//139a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "113", 
  "app_tag": "113a", 
  "app_key": "appeditor"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
