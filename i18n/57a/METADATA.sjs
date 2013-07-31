var METADATA = {
  "mounts": {
    "lib": "//140a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "57", 
  "app_tag": "57a", 
  "app_key": "i18n"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
