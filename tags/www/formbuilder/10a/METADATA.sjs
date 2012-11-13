var METADATA = {
  "mounts": {
    "lib": "//93a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "10", 
  "app_tag": "10a", 
  "app_key": "formbuilder"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
