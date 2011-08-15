var METADATA = {
  "mounts": {
    "site": "//12a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "16", 
  "app_tag": "16a", 
  "app_key": "account"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");