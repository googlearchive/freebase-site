var app_labels = {
  "admin"                   : "//12f.admin.site.tags.freebase-site.googlecode.dev",
  "homepage"                : "//20a.homepage.site.tags.freebase-site.googlecode.dev",
  "routing"                 : "//61f.routing.site.tags.freebase-site.googlecode.dev"
};

var routing = acre.require(app_labels["routing"] + "/routes");
routing.host_based_redirects(acre.request);
routing.path_based_routing(acre.request, app_labels);