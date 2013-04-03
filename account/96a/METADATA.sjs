var METADATA = {
  "mounts": {
    "lib": "//123a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "96", 
  "app_tag": "96a", 
  "app_key": "account"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
