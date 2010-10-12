var mf = {
  "apps" : {
    "appadmin"          : "//appadmin.site.freebase.dev",
    "appeditor"         : "//appeditor.site.freebase.dev",
    "appeditor-services": "//appeditor-services.site.freebase.dev",
    "apps"              : "//apps.site.freebase.dev",
    "core"              : "//core.site.freebase.dev",
    "cubed"             : "//cubed.dfhuynh.user.dev",
    "codemirror"        : "//codemirror.site.freebase.dev",
    "cuecard"           : "//cuecard.site.freebase.dev",
    "devdocs"           : "//devdocs.site.freebase.dev",
    "domain"            : "//domain.site.freebase.dev",
    "error"             : "//error.site.freebase.dev",
    "homepage"          : "//homepage.site.freebase.dev",
    "i18n"              : "//i18n.site.freebase.dev",
    "jqueryui"          : "//jqueryui.site.freebase.dev",
    "labs"              : "//labs-site.dfhuynh.user.dev",
    "parallax"          : "//parallax.dfhuynh.user.dev",
    "permission"        : "//permission.site.freebase.dev",
    "policies"          : "//policies.site.freebase.dev",
    "promise"           : "//promise.site.freebase.dev",
    "queries"           : "//queries.site.freebase.dev",
    "queryeditor"       : "//cuecard.dfhuynh.user.dev",
    "routing"           : "//routing.site.freebase.dev",
    "sample"            : "//sample.site.freebase.dev",
    "sample2"            : "//sample2.site.freebase.dev",
    "schema"            : "//schema.site.freebase.dev",
    "tasks"             : "//tasks.site.freebase.dev",
    "template"          : "//template.site.freebase.dev",
    "tmt"               : "//tmt.zenkat.user.dev",
    "toolbox"           : "//toolbox.site.freebase.dev",
    "topicblocks"       : "//topicbox.daepark.user.dev",
    "triples"           : "//triples.site.freebase.dev",
    "validator"         : "//validator.site.freebase.dev"
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

acre.require(mf.apps.core + "/MANIFEST").init(mf, this);
