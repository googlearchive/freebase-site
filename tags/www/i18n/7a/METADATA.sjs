var METADATA = {
  "mounts": {
    "lib": "//90a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "7", 
  "app_tag": "7a", 
  "app_key": "i18n"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
