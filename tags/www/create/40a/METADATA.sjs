var METADATA = {
  "mounts": {
    "site": "//39a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "40a", 
  "app_version": "40", 
  "app_key": "create"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
