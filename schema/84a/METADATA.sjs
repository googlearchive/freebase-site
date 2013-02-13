var METADATA = {
  "mounts": {
    "lib": "//106a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "84", 
  "app_tag": "84a", 
  "app_key": "schema"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
