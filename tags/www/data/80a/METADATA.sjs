var METADATA = {
  "mounts": {
    "lib": "//109a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "80", 
  "app_tag": "80a", 
  "app_key": "data"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
