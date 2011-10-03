var METADATA = {
  "mounts": {
    "site": "//14a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "14", 
  "app_tag": "14a", 
  "app_key": "create"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");