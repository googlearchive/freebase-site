var METADATA = {
  "mounts": {
    "lib": "//113a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "0b", 
  "app_version": "0", 
  "app_key": "i18n"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
