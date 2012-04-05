var METADATA = {
  "mounts": {
    "site": "//28b.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "32", 
  "app_tag": "32a", 
  "app_key": "appeditor"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
