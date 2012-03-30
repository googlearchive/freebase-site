var METADATA = {
  "project": "freebase-site.googlecode.dev", 
  "mounts": {
    "lib": "//57c.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "27b", 
  "app_version": "27", 
  "app_key": "site"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
