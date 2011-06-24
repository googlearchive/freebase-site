var METADATA = {
  "mounts": {
    "lib": "//19a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 10, 
  "app_tag": "10a", 
  "app_key": "policies"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);