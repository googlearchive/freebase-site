var METADATA = {
  "project": "freebase-site.googlecode.dev", 
  "mounts": {
    "lib": "//55.lib.www.branches.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": null, 
  "app_version": 26, 
  "app_key": "site"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
