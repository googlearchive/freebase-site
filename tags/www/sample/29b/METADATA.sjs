var METADATA = {
  "mounts": {
    "site": "//26d.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "29", 
  "app_tag": "29b", 
  "app_key": "sample"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
