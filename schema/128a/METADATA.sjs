var METADATA = {
  "mounts": {
    "lib": "//150a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "128", 
  "app_tag": "128a", 
  "app_key": "schema"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
