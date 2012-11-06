var METADATA = {
  "mounts": {
    "lib": "//92a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "44", 
  "app_tag": "44a", 
  "app_key": "review"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
