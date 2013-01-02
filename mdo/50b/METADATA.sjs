var METADATA = {
  "mounts": {
    "lib": "//99b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "50", 
  "app_tag": "50b", 
  "app_key": "mdo"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
