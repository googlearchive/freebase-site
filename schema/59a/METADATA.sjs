var METADATA = {
  "mounts": {
    "lib": "//81b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "59", 
  "app_tag": "59a", 
  "app_key": "schema"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
