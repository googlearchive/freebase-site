var METADATA = {
  "project": "freebase-site.googlecode.dev", 
  "mounts": {
    "lib": "//51c.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "22b", 
  "app_version": "22", 
  "app_key": "site"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");