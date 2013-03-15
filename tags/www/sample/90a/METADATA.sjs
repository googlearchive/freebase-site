var METADATA = {
  "mounts": {
    "lib": "//118a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "90", 
  "app_tag": "90a", 
  "app_key": "sample"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
