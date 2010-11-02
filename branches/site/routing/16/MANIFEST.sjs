var mf = {
  "apps" : {
    "routing": "//routing.site.freebase.dev",
    "core" : "//core.site.freebase.dev",
    "template" : "//template.site.freebase.dev",
    "promise": "//promise.site.freebase.dev",
    "sample" : "//sample.site.freebase.dev",
    "domain" : "//domain.site.freebase.dev",
    "schema" : "//schema.site.freebase.dev",
    "toolbox": "//toolbox.site.freebase.dev",
    "appadmin" : "//appadmin.site.freebase.dev",
    "error" : "//error.site.freebase.dev",
    "homepage" : "//homepage.site.freebase.dev",
    "apps" : "//apps.site.freebase.dev",
    "devdocs" : "//devdocs.site.freebase.dev",
    "queries": "//queries.site.freebase.dev",
    "policies" : "//policies.site.freebase.dev",
    "permission": "//permission.site.freebase.dev",
    "appeditor" : "//appeditor.apps.freebase.dev",
    "jqueryui": "//jqueryui.site.freebase.dev",
    "tasks":"//tasks.site.freebase.dev",
    "validator": "//validator.site.freebase.dev"
  }
};

function is_release_pod() {
  return /^https?:\/\/(www\.)?(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(acre.request.app_url);
};

if (is_release_pod()) {
  for (var app in mf.apps) {
    mf.apps[app] = "//release." + mf.apps[app].slice(2);
  }
}

// map[path] = app label
var _app_paths = {};
for (var app in mf.apps) {
  var path = mf.apps[app];
  _app_paths[path] = app;
}
function get_app(path) {
  return _app_paths[path];
};

acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/routing/d41d8cd98f00b204e9800998ecf8427e", "static_base_url": "http://freebaselibs.com/static/freebase_site/routing/d41d8cd98f00b204e9800998ecf8427e"});
