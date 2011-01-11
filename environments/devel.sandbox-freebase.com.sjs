var app_labels = {
  "lib"               : "//lib.www.trunk.svn.freebase-site.googlecode.dev",

  "homepage"          : "//homepage.www.trunk.svn.freebase-site.googlecode.dev",

  "cubed"             : "//cubed",
  "labs"              : "//labs",
  "parallax"          : "//parallax",
  "tmt"               : "//tmt",
  "topicblocks"       : "//topicbox"
};

acre.require(app_labels["lib"] + "/routing/routes").route(acre.request, app_labels);