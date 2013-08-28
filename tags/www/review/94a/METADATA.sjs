var METADATA = {
  "mounts": {
    "lib": "//142a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "94", 
  "app_tag": "94a", 
  "app_key": "review"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
