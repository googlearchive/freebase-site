var METADATA = {
  "mounts": {
    "lib": "//120.lib.www.branches.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": null, 
  "app_version": 21, 
  "app_key": "search"
};

acre.require(METADATA.mounts.lib +
             "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
