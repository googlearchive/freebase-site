var METADATA = {
  "mounts": {
    "lib": "//129a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "80", 
  "app_tag": "80a", 
  "app_key": "mdo"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
