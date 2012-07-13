var METADATA = {
  "mounts": {
    "site": "//39a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "22", 
  "app_tag": "22a", 
  "app_key": "review"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
