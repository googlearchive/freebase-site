var METADATA = {
  "project": "freebase-site.googlecode.dev", 
  "mounts": {
    "lib": "//31a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "13a", 
  "app_version": "13", 
  "app_key": "site"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");