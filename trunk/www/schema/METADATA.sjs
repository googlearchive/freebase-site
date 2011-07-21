var METADATA = {
  "mounts": {
    "site":  "//site.www.trunk.svn.freebase-site.googlecode.dev"
  },
  "freebase": {
    "write_user": "appeditoruser"
  }
};

acre.require(METADATA.mounts.site + "/loader.sjs").extend_metadata(METADATA);