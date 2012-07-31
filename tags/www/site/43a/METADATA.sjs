var METADATA = {
  "app_version": "43", 
  "csrf_protection": "strong", 
  "app_key": "site", 
  "project": "freebase-site.googlecode.dev", 
  "mounts": {
    "lib": "//73a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "43a"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
