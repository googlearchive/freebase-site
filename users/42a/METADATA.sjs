var METADATA = {
  "mounts": {
    "lib": "//92a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "42", 
  "app_tag": "42a", 
  "app_key": "users"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
