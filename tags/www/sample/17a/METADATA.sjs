var METADATA = {
  "mounts": {
    "site": "//14a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "17", 
  "app_tag": "17a", 
  "app_key": "sample"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");