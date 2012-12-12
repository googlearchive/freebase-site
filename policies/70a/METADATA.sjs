var METADATA = {
  "mounts": {
    "lib": "//97a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "70", 
  "app_tag": "70a", 
  "app_key": "policies"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
