var METADATA = {
  "mounts": {
    "lib": "//90.lib.www.branches.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": null, 
  "app_version": 41, 
  "app_key": "mdo"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
