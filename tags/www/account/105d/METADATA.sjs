var METADATA = {
  "mounts": {
    "lib": "//132a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "105", 
  "app_tag": "105d", 
  "app_key": "account"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
