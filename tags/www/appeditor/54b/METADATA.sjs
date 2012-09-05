var METADATA = {
  "mounts": {
    "lib": "//80b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "54", 
  "app_tag": "54b", 
  "app_key": "appeditor"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
