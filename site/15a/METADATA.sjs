var METADATA = {
  "project": "freebase-site.googlecode.dev",
  "mounts": {
    "environments": "//environments.svn.freebase-site.googlecode.dev"
  }
};

var env_md = acre.require(METADATA.mounts.environments + "/" + acre.request.server_name).METADATA;
acre.require(env_md.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib", env_md);
