var METADATA = {
  "mounts": {
    "lib": "//123a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "94", 
  "app_tag": "94a", 
  "app_key": "data"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
