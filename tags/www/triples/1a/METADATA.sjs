var METADATA = {
  "mounts": {
    "lib": "//7j.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "1", 
  "app_tag": "1a", 
  "app_key": "triples"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);