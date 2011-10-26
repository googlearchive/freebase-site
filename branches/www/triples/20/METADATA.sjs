var METADATA = {
  "mounts": {
    "site": "//17.site.www.branches.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": null, 
  "app_version": 20, 
  "app_key": "triples"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");