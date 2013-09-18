var METADATA = {
  "mounts": {
    "lib": "//143a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "94", 
  "app_tag": "94a", 
  "app_key": "mdo"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
