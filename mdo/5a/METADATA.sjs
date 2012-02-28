var METADATA = {
  "mounts": {
    "site": "//23a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "5", 
  "app_tag": "5a", 
  "app_key": "mdo"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");