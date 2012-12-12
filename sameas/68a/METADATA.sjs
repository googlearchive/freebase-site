var METADATA = {
  "mounts": {
    "lib": "//97a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "68", 
  "app_tag": "68a", 
  "app_key": "sameas"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
