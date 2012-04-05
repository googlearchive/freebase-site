var METADATA = {
  "project": "freebase-site.googlecode.dev", 
  "mounts": {
    "lib": "//58a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "28b", 
  "app_version": "28", 
  "app_key": "site"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
