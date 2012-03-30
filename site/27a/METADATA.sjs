var METADATA = {
  "project": "freebase-site.googlecode.dev", 
  "mounts": {
    "lib": "//57b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "27a", 
  "app_version": "27", 
  "app_key": "site"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
