var METADATA = {
  "mounts": {
    "site": "//23a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "2", 
  "app_tag": "2a", 
  "app_key": "flyout"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
