var METADATA = {
  "mounts": {
    "site": "//14a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "16", 
  "app_tag": "16a", 
  "app_key": "sameas"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");