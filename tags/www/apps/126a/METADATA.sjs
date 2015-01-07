var METADATA = {
  "mounts": {
    "libraries": "//2.libraries.apps.freebase.dev", 
    "lib": "//152a.lib.www.tags.svn.freebase-site.googlecode.dev", 
    "service": "//service"
  }, 
  "app_version": "126", 
  "app_tag": "126a", 
  "app_key": "apps"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
