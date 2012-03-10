var METADATA = {
  "mounts": {
    "site": "//25a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "28", 
  "app_tag": "28a", 
  "app_key": "account"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
