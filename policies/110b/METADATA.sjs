var METADATA = {
  "mounts": {
    "lib": "//137b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "110", 
  "app_tag": "110b", 
  "app_key": "policies"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
