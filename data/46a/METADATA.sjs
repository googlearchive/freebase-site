var METADATA = {
  "mounts": {
    "site": "//45a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "46", 
  "app_tag": "46a", 
  "app_key": "data"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
