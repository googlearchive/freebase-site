var METADATA = {
  "mounts": {
    "site": "//28b.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "freebase": {
    "write_user": "appeditoruser"
  }, 
  "app_tag": "35a", 
  "app_version": "35", 
  "app_key": "schema"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
