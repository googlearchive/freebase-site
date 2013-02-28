var METADATA = {
  "mounts": {
    "lib": "//115a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "32", 
  "app_tag": "32a", 
  "app_key": "formbuilder"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
