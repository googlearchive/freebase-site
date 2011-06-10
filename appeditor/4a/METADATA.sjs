var METADATA = {
  "mounts": {
    "lib": "//14.lib.www.branches.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": null, 
  "app_version": 4, 
  "app_key": "appeditor"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);