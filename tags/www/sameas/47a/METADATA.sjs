var METADATA = {
  "mounts": {
    "site": "//45a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "47", 
  "app_tag": "47a", 
  "app_key": "sameas"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
