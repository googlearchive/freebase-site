var METADATA = {
  "mounts": {
    "site": "//44a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "48", 
  "app_tag": "48a", 
  "app_key": "policies"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
