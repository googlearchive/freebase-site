var METADATA = {
  "mounts": {
    "lib": "//141a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "119", 
  "app_tag": "119a", 
  "app_key": "schema"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
