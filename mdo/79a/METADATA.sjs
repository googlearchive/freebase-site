var METADATA = {
  "mounts": {
    "lib": "//128b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "79", 
  "app_tag": "79a", 
  "app_key": "mdo"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
