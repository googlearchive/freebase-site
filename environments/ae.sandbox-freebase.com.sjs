var app_labels = {
  "admin"             : "//12f.admin.site.tags.svn.freebase-site.googlecode.dev",
  "appeditor"         : "//appeditor.site.tags.svn.freebase-site.googlecode.dev",
  "appeditor-services": "//61f.appeditor-services.site.tags.svn.freebase-site.googlecode.dev",
  "apps"              : "//apps.site.tags.svn.freebase-site.googlecode.dev",
  "cubed"             : "//cubed.dfhuynh.user.dev",
  "cuecard"           : "//61f.cuecard.site.tags.svn.freebase-site.googlecode.dev",
  "codemirror"        : "//61f.codemirror.site.tags.svn.freebase-site.googlecode.dev",
  "devdocs"           : "//devdocs.site.tags.svn.freebase-site.googlecode.dev",
  "domain"            : "//domain.site.tags.svn.freebase-site.googlecode.dev",
  "error"             : "//error.site.tags.svn.freebase-site.googlecode.dev",
  "homepage"          : "//20b.homepage.site.tags.svn.freebase-site.googlecode.dev",
  "labs"              : "//labs-site.dfhuynh.user.dev",
  "parallax"          : "//parallax.dfhuynh.user.dev",
  "permission"        : "//61f.permission.site.tags.svn.freebase-site.googlecode.dev",
  "policies"          : "//policies.site.tags.svn.freebase-site.googlecode.dev",
  "queryeditor"       : "//cuecard.dfhuynh.user.dev",
  "sample"            : "//sample.site.tags.svn.freebase-site.googlecode.dev",
  "app_template_barebones"  : "//app_template_barebones.site.tags.svn.freebase-site.googlecode.dev",
  "app_template_freebase"   : "//app_template_freebase.site.tags.svn.freebase-site.googlecode.dev",
  "schema"            : "//schema.site.tags.svn.freebase-site.googlecode.dev",
  "tasks"             : "//tasks.site.tags.svn.freebase-site.googlecode.dev",
  "tmt"               : "//tmt.zenkat.user.dev",
  "toolbox"           : "//61f.toolbox.site.tags.svn.freebase-site.googlecode.dev",
  "topicblocks"       : "//topicbox.daepark.user.dev",
  "triples"           : "//triples.site.tags.svn.freebase-site.googlecode.dev",
  "template"          : "//61f.template.site.tags.svn.freebase-site.googlecode.dev",
  "routing"           : "//61.routing.site.branches.svn.freebase-site.googlecode.dev"
};

var routing = acre.require(app_labels["routing"] + "/routes");
routing.host_based_redirects(acre.request);
routing.path_based_routing(acre.request, app_labels);