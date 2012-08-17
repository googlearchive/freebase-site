var METADATA = {
  "mounts": {
    "site": "//46b.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "48", 
  "app_tag": "48a", 
  "app_key": "sameas"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
