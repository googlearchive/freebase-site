var METADATA = {
  "mounts": {
    "lib": "//93a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "65", 
  "app_tag": "65a", 
  "app_key": "sample"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
