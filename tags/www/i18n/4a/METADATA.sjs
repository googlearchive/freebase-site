var METADATA = {
  "mounts": {
    "lib": "//86a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "4", 
  "app_tag": "4a", 
  "app_key": "i18n"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
