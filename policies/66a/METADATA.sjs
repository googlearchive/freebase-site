var METADATA = {
  "mounts": {
    "lib": "//93a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "66", 
  "app_tag": "66a", 
  "app_key": "policies"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
