var METADATA = {
  "project": "freebase-site.googlecode.dev", 
  "mounts": {
    "lib": "//30f.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "12b", 
  "app_version": "12", 
  "app_key": "site"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");