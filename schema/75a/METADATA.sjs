var METADATA = {
  "mounts": {
    "lib": "//97a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "75", 
  "app_tag": "75a", 
  "app_key": "schema"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
