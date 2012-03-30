var METADATA = {
  "mounts": {
    "site": "//26a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "26", 
  "app_tag": "26a", 
  "app_key": "create"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
