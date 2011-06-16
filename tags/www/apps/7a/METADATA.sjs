var METADATA = {
  "mounts": {
    "lib": "//15.lib.www.branches.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": null, 
  "app_version": 7, 
  "app_key": "apps"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);