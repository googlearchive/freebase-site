var METADATA = {
  "mounts": {
    "site": "//19a.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "23", 
  "app_tag": "23a", 
  "app_key": "triples"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");