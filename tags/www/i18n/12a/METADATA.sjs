var METADATA = {
  "mounts": {
    "lib": "//95a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "12", 
  "app_tag": "12a", 
  "app_key": "i18n"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
