var METADATA = {
  "mounts": {
    "lib": "//81b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "53", 
  "app_tag": "53a", 
  "app_key": "sameas"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
