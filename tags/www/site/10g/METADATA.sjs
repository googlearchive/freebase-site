var METADATA = {
  "project": "freebase-site.googlecode.dev", 
  "mounts": {
    "lib": "//27m.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "10g", 
  "app_version": "10", 
  "app_key": "site"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");