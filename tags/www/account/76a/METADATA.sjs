var METADATA = {
  "mounts": {
    "lib": "//103a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "76", 
  "app_tag": "76a", 
  "app_key": "account"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
