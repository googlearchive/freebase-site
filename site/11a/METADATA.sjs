var METADATA = {
  "project": "freebase-site.googlecode.dev", 
  "mounts": {
    "lib": "//28a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "11a", 
  "app_version": "11", 
  "app_key": "site"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");