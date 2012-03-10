var METADATA = {
  "mounts": {
    "site": "//25a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "4", 
  "app_tag": "4a", 
  "app_key": "flyout"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
