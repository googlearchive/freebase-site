var METADATA = {
  "mounts": {
    "site": "//26d.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "33", 
  "app_tag": "33b", 
  "app_key": "topic"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
