var METADATA = {
  "mounts": {
    "lib": "//122c.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "92", 
  "app_tag": "92b", 
  "app_key": "create"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
