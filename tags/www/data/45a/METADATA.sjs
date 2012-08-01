var METADATA = {
  "mounts": {
    "site": "//44a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "45", 
  "app_tag": "45a", 
  "app_key": "data"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
