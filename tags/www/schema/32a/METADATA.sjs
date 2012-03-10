var METADATA = {
  "mounts": {
    "site": "//25a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "freebase": {
    "write_user": "appeditoruser"
  }, 
  "app_tag": "32a", 
  "app_version": "32", 
  "app_key": "schema"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
