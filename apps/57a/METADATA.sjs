var METADATA = {
  "mounts": {
    "libraries": "//2.libraries.apps.freebase.dev", 
    "lib": "//82a.lib.www.tags.svn.freebase-site.googlecode.dev", 
    "service": "//service"
  }, 
  "app_version": "57", 
  "app_tag": "57a", 
  "app_key": "apps"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
