var METADATA = {
  "mounts": {
    "lib": "//99b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "72", 
  "app_tag": "72b", 
  "app_key": "policies"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
