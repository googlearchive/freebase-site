var METADATA = {
  "mounts": {
    "lib": "//141a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "57", 
  "app_tag": "57a", 
  "app_key": "formbuilder"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
