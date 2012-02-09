var METADATA = {
  "mounts": {
    "site": "//22b.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "23", 
  "app_tag": "23a", 
  "app_key": "query"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");