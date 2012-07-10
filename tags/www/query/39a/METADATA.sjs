var METADATA = {
  "mounts": {
    "site": "//38a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "39", 
  "app_tag": "39a", 
  "app_key": "query"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
