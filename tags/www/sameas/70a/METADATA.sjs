var METADATA = {
  "mounts": {
    "lib": "//99b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "70", 
  "app_tag": "70a", 
  "app_key": "sameas"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
