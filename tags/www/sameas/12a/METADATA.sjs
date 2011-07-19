var METADATA = {
  "mounts": {
    "lib": "//23b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 12, 
  "app_tag": "12a", 
  "app_key": "sameas"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);