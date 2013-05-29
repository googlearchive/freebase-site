var METADATA = {
  "mounts": {
    "lib": "//133a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "85", 
  "app_tag": "85a", 
  "app_key": "review"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
