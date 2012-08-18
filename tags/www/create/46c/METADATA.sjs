var METADATA = {
  "mounts": {
    "site": "//46c.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "46", 
  "app_tag": "46c", 
  "app_key": "create"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
