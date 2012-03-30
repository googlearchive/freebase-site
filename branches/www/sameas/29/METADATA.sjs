var METADATA = {
  "mounts": {
    "site": "//site.www.trunk.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": null, 
  "app_version": 29, 
  "app_key": "sameas"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
