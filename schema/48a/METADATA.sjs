var METADATA = {
  "mounts": {
    "site": "//41a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "freebase": {
    "write_user": "appeditoruser"
  }, 
  "app_tag": "48a", 
  "app_version": "48", 
  "app_key": "schema"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
