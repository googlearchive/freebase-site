var METADATA = {
  "mounts": {
    "lib": "//80b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "53", 
  "app_tag": "53b", 
  "app_key": "account"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
