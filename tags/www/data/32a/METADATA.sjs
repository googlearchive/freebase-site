var METADATA = {
  "mounts": {
    "site": "//31a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "32", 
  "app_tag": "32a", 
  "app_key": "data"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
