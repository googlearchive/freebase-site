var METADATA = {
  "mounts": {
    "lib": "//90a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "42", 
  "app_tag": "42a", 
  "app_key": "review"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
