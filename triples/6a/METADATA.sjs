var METADATA = {
  "mounts": {
    "lib": "//15a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 6, 
  "app_tag": "6a", 
  "app_key": "triples"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);