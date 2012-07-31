var METADATA = {
  "mounts": {
    "site": "//43a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "50", 
  "app_tag": "50a", 
  "app_key": "topic"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
