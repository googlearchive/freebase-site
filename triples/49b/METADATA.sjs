var METADATA = {
  "mounts": {
    "site": "//46c.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "49", 
  "app_tag": "49b", 
  "app_key": "triples"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
