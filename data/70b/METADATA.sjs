var METADATA = {
  "mounts": {
    "lib": "//99b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "70", 
  "app_tag": "70b", 
  "app_key": "data"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
