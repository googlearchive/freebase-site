var app_labels = {  
  "lib"               : "//lib.site.trunk.svn.freebase-site.googlecode.dev",

  "admin"             : "//admin.site.trunk.svn.freebase-site.googlecode.dev",
  "appeditor"         : "//appeditor.site.trunk.svn.freebase-site.googlecode.dev",
  "apps"              : "//apps.site.trunk.svn.freebase-site.googlecode.dev",
  "devdocs"           : "//devdocs.site.trunk.svn.freebase-site.googlecode.dev",
  "domain"            : "//domain.site.trunk.svn.freebase-site.googlecode.dev",
  "error"             : "//error.site.trunk.svn.freebase-site.googlecode.dev",
  "homepage"          : "//homepage_lib.site.trunk.svn.freebase-site.googlecode.dev",
  "policies"          : "//policies.site.trunk.svn.freebase-site.googlecode.dev",
  "queryeditor"       : "//queryeditor.site.trunk.svn.freebase-site.googlecode.dev",
  "sample"            : "//sample.site.trunk.svn.freebase-site.googlecode.dev",
  "app_template_barebones"  : "//app_template_barebones.site.trunk.svn.freebase-site.googlecode.dev",
  "app_template_freebase"   : "//app_template_freebase.site.trunk.svn.freebase-site.googlecode.dev",
  "schema"            : "//schema.site.trunk.svn.freebase-site.googlecode.dev",
  "tasks"             : "//tasks.site.trunk.svn.freebase-site.googlecode.dev",
  "toolbox"           : "//toolbox.site.trunk.svn.freebase-site.googlecode.dev",
  "triples"           : "//triples.site.trunk.svn.freebase-site.googlecode.dev",

  "cubed"             : "//cubed",
  "labs"              : "//labs",
  "parallax"          : "//parallax",
  "tmt"               : "//tmt",
  "topicblocks"       : "//topicbox"
};

acre.require(app_labels["lib"] + "/routing/routes").route(acre.request, app_labels);