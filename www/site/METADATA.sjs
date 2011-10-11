var METADATA = {
  "project": "freebase-site.googlecode.dev",
  "mounts": {
    "lib":  "//lib.www.trunk.svn.freebase-site.googlecode.dev"
  }
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");