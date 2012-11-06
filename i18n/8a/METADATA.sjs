var METADATA = {
  "mounts": {
    "lib": "//91a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "8", 
  "app_tag": "8a", 
  "app_key": "i18n"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
