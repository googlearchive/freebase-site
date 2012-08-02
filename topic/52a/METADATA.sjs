var METADATA = {
  "mounts": {
    "site": "//45a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "52", 
  "app_tag": "52a", 
  "app_key": "topic"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
