var METADATA = {
  "project": "freebase-site.googlecode.dev", 
  "mounts": {
    "lib": "//55c.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "26d", 
  "app_version": "26", 
  "app_key": "site"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
