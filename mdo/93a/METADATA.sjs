var METADATA = {
  "mounts": {
    "lib": "//142a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "93", 
  "app_tag": "93a", 
  "app_key": "mdo"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
