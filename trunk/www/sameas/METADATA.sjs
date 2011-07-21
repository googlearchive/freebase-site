var METADATA = {
  "mounts": {
    "site":  "//site.www.trunk.svn.freebase-site.googlecode.dev"
  }
};

acre.require(METADATA.mounts.site + "/loader.sjs").extend_metadata(METADATA);