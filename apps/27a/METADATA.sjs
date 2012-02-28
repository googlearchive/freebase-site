var METADATA = {
  "mounts": {
    "libraries": "//2.libraries.apps.freebase.dev", 
    "site": "//23a.site.www.tags.svn.freebase-site.googlecode.dev", 
    "service": "//service"
  }, 
  "app_version": "27", 
  "app_tag": "27a", 
  "app_key": "apps"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");