var METADATA = {
  "mounts": {
    "lib": "//137b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "107", 
  "app_tag": "107b", 
  "app_key": "create"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
