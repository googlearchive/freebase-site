var METADATA = {
  "mounts": {
    "lib": "//105a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "79", 
  "app_tag": "79a", 
  "app_key": "appeditor"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
