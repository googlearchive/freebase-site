var METADATA = {
  "mounts": {
    "lib": "//92a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "64", 
  "app_tag": "64a", 
  "app_key": "sample"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
