var METADATA = {
  "mounts": {
    "site": "//41a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "42", 
  "app_tag": "42a", 
  "app_key": "query"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
