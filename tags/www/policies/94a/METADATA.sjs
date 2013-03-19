var METADATA = {
  "mounts": {
    "lib": "//121a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "94", 
  "app_tag": "94a", 
  "app_key": "policies"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
