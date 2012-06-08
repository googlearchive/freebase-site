var METADATA = {
  "mounts": {
    "site": "//34a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "35", 
  "app_tag": "35a", 
  "app_key": "query"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
