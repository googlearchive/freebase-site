var METADATA = {
  "mounts": {
    "lib": "//121a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "99", 
  "app_tag": "99a", 
  "app_key": "schema"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
