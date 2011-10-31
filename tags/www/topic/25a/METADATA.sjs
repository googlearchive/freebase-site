var METADATA = {
  "mounts": {
    "site": "//18a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "25", 
  "app_tag": "25a", 
  "app_key": "topic"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");