var METADATA = {
  "mounts": {
    "site": "//43a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "2", 
  "app_tag": "2a", 
  "app_key": "discuss"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
