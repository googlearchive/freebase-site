var METADATA = {
  "mounts": {
    "site": "//12b.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "15", 
  "app_tag": "15b", 
  "app_key": "group"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");