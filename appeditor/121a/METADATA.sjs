var METADATA = {
  "mounts": {
    "lib": "//147a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "121", 
  "app_tag": "121a", 
  "app_key": "appeditor"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
