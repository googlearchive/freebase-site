var METADATA = {
  "mounts": {
    "lib": "//113a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "30", 
  "app_tag": "30a", 
  "app_key": "formbuilder"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
