var METADATA = {
  "mounts": {
    "libraries": "//2.libraries.apps.freebase.dev", 
    "lib": "//93a.lib.www.tags.svn.freebase-site.googlecode.dev", 
    "service": "//service"
  }, 
  "app_version": "68", 
  "app_tag": "68a", 
  "app_key": "apps"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
