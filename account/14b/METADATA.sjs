var METADATA = {
  "mounts": {
    "site": "//10g.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "14", 
  "app_tag": "14b", 
  "app_key": "account"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");