var METADATA = {
  "mounts": {
    "lib": "//148a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "121", 
  "app_tag": "121a", 
  "app_key": "account"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
