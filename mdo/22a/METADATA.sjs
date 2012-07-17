var METADATA = {
  "mounts": {
    "site": "//39a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "22a", 
  "app_version": "22", 
  "app_key": "mdo"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
