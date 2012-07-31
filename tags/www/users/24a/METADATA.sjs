var METADATA = {
  "mounts": {
    "site": "//43a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "24", 
  "app_tag": "24a", 
  "app_key": "users"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
