var METADATA = {
  "project": "freebase-site.googlecode.dev", 
  "mounts": {
    "lib": "//54a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "25a", 
  "app_version": "25", 
  "app_key": "site"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
