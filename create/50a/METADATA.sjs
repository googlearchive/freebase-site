var METADATA = {
  "mounts": {
    "lib": "//80a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "50", 
  "app_tag": "50a", 
  "app_key": "create"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
