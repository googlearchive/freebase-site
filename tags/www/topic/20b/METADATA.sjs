var METADATA = {
  "mounts": {
    "site": "//12b.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "20", 
  "app_tag": "20b", 
  "app_key": "topic"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");