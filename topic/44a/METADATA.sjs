var METADATA = {
  "mounts": {
    "site": "//37a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "44", 
  "app_tag": "44a", 
  "app_key": "topic"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
