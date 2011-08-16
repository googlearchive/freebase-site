var METADATA = {
  "mounts": {
    "libraries": "//2.libraries.apps.freebase.dev", 
    "site": "//12b.site.www.tags.svn.freebase-site.googlecode.dev", 
    "service": "//service"
  }, 
  "app_version": "17", 
  "app_tag": "17b", 
  "app_key": "apps"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");