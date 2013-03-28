var METADATA = {
  "mounts": {
    "lib": "//122c.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "96", 
  "app_tag": "96b", 
  "app_key": "appeditor"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
