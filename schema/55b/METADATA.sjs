var METADATA = {
  "mounts": {
    "lib": "//78b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "55", 
  "app_tag": "55b", 
  "app_key": "schema"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
