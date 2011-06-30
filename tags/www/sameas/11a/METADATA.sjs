var METADATA = {
  "mounts": {
    "lib": "//22.lib.www.branches.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": null, 
  "app_version": 11, 
  "app_key": "sameas"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);