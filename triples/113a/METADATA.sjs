var METADATA = {
  "mounts": {
    "lib": "//141a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "113", 
  "app_tag": "113a", 
  "app_key": "triples"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
