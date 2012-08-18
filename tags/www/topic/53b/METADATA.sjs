var METADATA = {
  "mounts": {
    "site": "//46c.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "53", 
  "app_tag": "53b", 
  "app_key": "topic"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
