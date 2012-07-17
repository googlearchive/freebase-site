var METADATA = {
  "mounts": {
    "site": "//39.site.www.branches.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 22, 
  "app_tag": null, 
  "app_key": "mdo"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
