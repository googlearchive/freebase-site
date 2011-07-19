var METADATA = {
  "mounts": {
    "lib": "//23b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 16, 
  "app_tag": "16a", 
  "app_key": "homepage"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);