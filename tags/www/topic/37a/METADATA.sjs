var METADATA = {
  "mounts": {
    "site": "//30a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "37", 
  "app_tag": "37a", 
  "app_key": "topic"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
