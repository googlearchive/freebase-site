var METADATA = {
  "mounts": {
    "site": "//30a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "33", 
  "app_tag": "33a", 
  "app_key": "account"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
