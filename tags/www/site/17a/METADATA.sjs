var METADATA = {
  "project": "freebase-site.googlecode.dev", 
  "mounts": {
    "lib": "//36a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "17a", 
  "app_version": "17", 
  "app_key": "site"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");