var METADATA = {
  "mounts": {
    "lib": "//136a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "114", 
  "app_tag": "114a", 
  "app_key": "schema"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
