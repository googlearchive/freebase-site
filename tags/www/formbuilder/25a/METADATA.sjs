var METADATA = {
  "mounts": {
    "lib": "//108a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "25", 
  "app_tag": "25a", 
  "app_key": "formbuilder"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
