var METADATA = {
  "mounts": {
    "lib": "//13a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 4, 
  "app_tag": "4a", 
  "app_key": "triples"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);