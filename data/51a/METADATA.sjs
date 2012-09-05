var METADATA = {
  "mounts": {
    "lib": "//80a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "51", 
  "app_tag": "51a", 
  "app_key": "data"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
