var METADATA = {
  "mounts": {
    "site": "//26d.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "27", 
  "app_tag": "27b", 
  "app_key": "query"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
