var METADATA = {
  "mounts": {
    "lib": "//12.lib.www.branches.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": null, 
  "app_version": 3, 
  "app_key": "triples"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);