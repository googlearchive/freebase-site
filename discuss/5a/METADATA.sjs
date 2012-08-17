var METADATA = {
  "mounts": {
    "site": "//46a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "5", 
  "app_tag": "5a", 
  "app_key": "discuss"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
