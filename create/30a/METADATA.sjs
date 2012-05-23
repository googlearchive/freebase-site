var METADATA = {
  "mounts": {
    "site": "//30a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "30", 
  "app_tag": "30a", 
  "app_key": "create"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
