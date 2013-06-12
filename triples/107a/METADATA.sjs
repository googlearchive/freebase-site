var METADATA = {
  "mounts": {
    "lib": "//135a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "107", 
  "app_tag": "107a", 
  "app_key": "triples"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
