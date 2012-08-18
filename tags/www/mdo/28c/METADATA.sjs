var METADATA = {
  "mounts": {
    "site": "//46c.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "28", 
  "app_tag": "28c", 
  "app_key": "mdo"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
