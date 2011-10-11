var METADATA = {
  "project": "freebase-site.googlecode.dev", 
  "mounts": {
    "lib": "//35b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "16a", 
  "app_version": "16", 
  "app_key": "site"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");