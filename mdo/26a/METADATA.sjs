var METADATA = {
  "mounts": {
    "site": "//44a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "26", 
  "app_tag": "26a", 
  "app_key": "mdo"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
