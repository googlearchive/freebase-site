var METADATA = {
  "mounts": {
    "site": "//18c.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "21", 
  "app_tag": "21a", 
  "app_key": "sameas"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");