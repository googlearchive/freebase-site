var METADATA = {
  "mounts": {
    "lib": "//145a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "118", 
  "app_tag": "118a", 
  "app_key": "policies"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
