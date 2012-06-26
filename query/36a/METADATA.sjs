var METADATA = {
  "mounts": {
    "site": "//35a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "36", 
  "app_tag": "36a", 
  "app_key": "query"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
