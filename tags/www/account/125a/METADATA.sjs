var METADATA = {
  "mounts": {
    "lib": "//152a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "125", 
  "app_tag": "125a", 
  "app_key": "account"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
