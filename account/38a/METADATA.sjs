var METADATA = {
  "mounts": {
    "site": "//35a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "38", 
  "app_tag": "38a", 
  "app_key": "account"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
