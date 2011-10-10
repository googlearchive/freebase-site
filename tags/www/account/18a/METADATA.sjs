var METADATA = {
  "mounts": {
    "site": "//15a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "18", 
  "app_tag": "18a", 
  "app_key": "account"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");