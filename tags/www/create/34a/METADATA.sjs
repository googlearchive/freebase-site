var METADATA = {
  "mounts": {
    "site": "//34a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "34", 
  "app_tag": "34a", 
  "app_key": "create"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
