var METADATA = {
  "mounts": {
    "lib":  "//lib.www.trunk.svn.freebase-site.googlecode.dev",
    "libraries": "//2.libraries.apps.freebase.dev",
    "service": "//service"
  }
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
