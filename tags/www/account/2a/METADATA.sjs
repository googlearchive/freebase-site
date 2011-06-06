var METADATA = {
  "mounts": {
    "lib": "//13.lib.www.branches.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": null, 
  "app_version": 2, 
  "app_key": "account"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);