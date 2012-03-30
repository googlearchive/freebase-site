var METADATA = {
  "mounts": {
    "site": "//27b.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "27", 
  "app_tag": "27a", 
  "app_key": "create"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
