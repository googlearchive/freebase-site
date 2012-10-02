var METADATA = {
  "mounts": {
    "lib": "//86a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "56", 
  "app_tag": "56a", 
  "app_key": "create"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
