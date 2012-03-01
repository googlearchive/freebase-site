var METADATA = {
  "mounts": {
    "site": "//24a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "6", 
  "app_tag": "6a", 
  "app_key": "review"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
