var METADATA = {
  "mounts": {
    "lib": "//104a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "56", 
  "app_tag": "56a", 
  "app_key": "review"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
