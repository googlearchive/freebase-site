var METADATA = {
  "mounts": {
    "lib": "//88a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "40", 
  "app_tag": "40a", 
  "app_key": "mdo"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
