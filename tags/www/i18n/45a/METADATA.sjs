var METADATA = {
  "mounts": {
    "lib": "//128b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "45", 
  "app_tag": "45a", 
  "app_key": "i18n"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
