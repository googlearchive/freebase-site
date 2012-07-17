var METADATA = {
  "app_version": 40, 
  "csrf_protection": "strong", 
  "app_key": "site", 
  "project": "freebase-site.googlecode.dev", 
  "mounts": {
    "lib": "//69.lib.www.branches.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": null
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
