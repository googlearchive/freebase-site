var METADATA = {
  "mounts": {
    "lib": "//105a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "56", 
  "app_tag": "56a", 
  "app_key": "mdo"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
