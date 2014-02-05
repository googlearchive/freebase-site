var METADATA = {
  "mounts": {
    "lib": "//147a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "119", 
  "app_tag": "119a", 
  "app_key": "sample"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
