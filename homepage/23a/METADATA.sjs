var METADATA = {
  "mounts": {
    "site": "//17a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "23", 
  "app_tag": "23a", 
  "app_key": "homepage"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");