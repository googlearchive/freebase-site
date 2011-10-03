var METADATA = {
  "project": "freebase-site.googlecode.dev", 
  "mounts": {
    "lib": "//32a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "14a", 
  "app_version": "14", 
  "app_key": "site"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");