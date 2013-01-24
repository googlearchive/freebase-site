var METADATA = {
  "mounts": {
    "lib": "//103a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "75", 
  "app_tag": "75a", 
  "app_key": "triples"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
