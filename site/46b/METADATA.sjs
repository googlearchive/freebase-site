var METADATA = {
  "app_version": "46", 
  "csrf_protection": "strong", 
  "app_key": "site", 
  "project": "freebase-site.googlecode.dev", 
  "mounts": {
    "lib": "//76b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "46b"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
