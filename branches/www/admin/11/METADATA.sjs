var METADATA = {
  "mounts": {
    "site": "//10.site.www.branches.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": null, 
  "app_version": 11, 
  "app_key": "admin"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");