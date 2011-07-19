var METADATA = {
  "mounts": {
    "lib": "//23b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 14, 
  "app_tag": "14a", 
  "app_key": "apps"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);