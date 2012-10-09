var METADATA = {
  "mounts": {
    "lib": "//88a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "41", 
  "app_tag": "41a", 
  "app_key": "review"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
