var METADATA = {
  "mounts": {
    "lib": "//128b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "106", 
  "app_tag": "106a", 
  "app_key": "schema"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
