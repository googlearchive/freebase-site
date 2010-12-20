var app_labels = {
  "admin"             : "//13b.admin.site.tags.svn.freebase-site.googlecode.dev",
  "appeditor"         : "//5a.appeditor.site.tags.svn.freebase-site.googlecode.dev",
  "appeditor-services": "//62b.appeditor-services.site.tags.svn.freebase-site.googlecode.dev",
  "apps"              : "//19a.apps.site.tags.svn.freebase-site.googlecode.dev",
  "cubed"             : "//cubed",
  "cuecard"           : "//62b.cuecard.site.tags.svn.freebase-site.googlecode.dev",
  "codemirror"        : "//62b.codemirror.site.tags.svn.freebase-site.googlecode.dev",
  "devdocs"           : "//20a.devdocs.site.tags.svn.freebase-site.googlecode.dev",
  "error"             : "//17a.error.site.tags.svn.freebase-site.googlecode.dev",
  "homepage"          : "//21a.homepage.site.tags.svn.freebase-site.googlecode.dev",
  "labs"              : "//labs",
  "parallax"          : "//parallax",
  "permission"        : "//62b.permission.site.tags.svn.freebase-site.googlecode.dev",
  "policies"          : "//15a.policies.site.tags.svn.freebase-site.googlecode.dev",
  "queryeditor"       : "//cuecard",
  "schema"            : "//27a.schema.site.tags.svn.freebase-site.googlecode.dev",
  "tmt"               : "//tmt",
  "toolbox"           : "//61f.toolbox.site.tags.svn.freebase-site.googlecode.dev",
  "topicblocks"       : "//topicbox",
  "triples"           : "//16a.triples.site.tags.svn.freebase-site.googlecode.dev",
  "template"          : "//62b.template.site.tags.svn.freebase-site.googlecode.dev",
  "routing"           : "//62b.routing.site.tags.svn.freebase-site.googlecode.dev"
};

acre.require(app_labels["routing"] + "/routes").route(acre.request, app_labels);
