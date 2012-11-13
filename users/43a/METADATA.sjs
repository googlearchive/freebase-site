var METADATA = {
  "mounts": {
    "lib": "//93a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "43", 
  "app_tag": "43a", 
  "app_key": "users"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
