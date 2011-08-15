var METADATA = {
  "mounts": {
    "site": "//12a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "15", 
  "app_tag": "15a", 
  "app_key": "sameas"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");