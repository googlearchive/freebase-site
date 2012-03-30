var METADATA = {
  "mounts": {
    "site": "//26d.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "26", 
  "app_tag": "26c", 
  "app_key": "create"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
