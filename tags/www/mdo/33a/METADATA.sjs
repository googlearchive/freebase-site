var METADATA = {
  "mounts": {
    "lib": "//81b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "33", 
  "app_tag": "33a", 
  "app_key": "mdo"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
