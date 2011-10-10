var METADATA = {
  "mounts": {
    "site": "//15a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "17", 
  "app_tag": "17a", 
  "app_key": "group"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");