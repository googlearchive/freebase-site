var METADATA = {
  "project": "freebase-site.googlecode.dev", 
  "mounts": {
    "lib": "//37a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "18a", 
  "app_version": "18", 
  "app_key": "site"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");