var METADATA = {
  "project": "freebase-site.googlecode.dev", 
  "mounts": {
    "lib": "//45a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "18c", 
  "app_version": "18", 
  "app_key": "site"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");