var METADATA = {
  "mounts": {
    "site": "//39.site.www.branches.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 41, 
  "app_tag": null, 
  "app_key": "query"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
