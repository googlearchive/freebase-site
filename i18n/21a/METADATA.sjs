var METADATA = {
  "mounts": {
    "lib": "//104a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "21", 
  "app_tag": "21a", 
  "app_key": "i18n"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
