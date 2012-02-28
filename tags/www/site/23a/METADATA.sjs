var METADATA = {
  "project": "freebase-site.googlecode.dev", 
  "mounts": {
    "lib": "//52b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "23a", 
  "app_version": "23", 
  "app_key": "site"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");