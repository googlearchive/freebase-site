var METADATA = {
  "mounts": {
    "lib": "//119a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "36", 
  "app_tag": "36a", 
  "app_key": "formbuilder"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
