var METADATA = {
  "mounts": {
    "lib": "//11o.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 1, 
  "app_tag": "1b", 
  "app_key": "sameas"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);