var METADATA = {
  "mounts": {
    "site": "//22b.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "1", 
  "app_tag": "1a", 
  "app_key": "flyout"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
