var METADATA = {
  "mounts": {
    "site": "//46b.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "47", 
  "app_tag": "47a", 
  "app_key": "query"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
