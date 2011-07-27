var METADATA = {
  "mounts": {
    "site": "//10g.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "18", 
  "app_tag": "18a", 
  "app_key": "topic"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");