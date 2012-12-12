var METADATA = {
  "mounts": {
    "lib": "//97a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "48", 
  "app_tag": "48a", 
  "app_key": "mdo"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
