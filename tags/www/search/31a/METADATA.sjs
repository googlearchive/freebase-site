var METADATA = {
  "mounts": {
    "lib": "//130.lib.www.branches.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": null, 
  "app_version": 31, 
  "app_key": "search"
};

acre.require(METADATA.mounts.lib +
             "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
