var METADATA = {
  "mounts": {
    "lib": "//128b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "102", 
  "app_tag": "102a", 
  "app_key": "appeditor"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
