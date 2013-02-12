var METADATA = {
  "mounts": {
    "lib": "//105b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "78", 
  "app_tag": "78b", 
  "app_key": "policies"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
