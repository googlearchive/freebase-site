var mf = acre.require("MANIFEST").MF;
var t = acre.require("template");

var api = {

  apps: function(args, headers) {
    var list_user_apps = acre.require("/freebase/apps/appeditor/list_user_apps", mf.version["/freebase/apps/appeditor"]).list_user_apps;
    var apps = list_user_apps(args.id, args.include_filenames);
    return {
      data: apps,
      html: acre.markup.stringify(t.apps_toolbox(apps))
    };
  },

  queries: function(args, headers) {
    var q = acre.require("queries").query;
    q = acre.freebase.extend_query(q, {creator:args.id});
    var views = acre.freebase.mqlread(q).result;
    return {
      data: views,
      html: acre.markup.stringify(t.queries_toolbox(views))
    };
  }

};

api.apps.args = ["id"];
api.apps.auth = true;

api.queries.args = ["id"];
api.queries.auth = true;

function main(scope) {
  var service = acre.require("/freebase/site/core/service", mf.version["/freebase/site/core"]);
  service.main(scope, api);
};

if (acre.current_script == acre.request.script) {
  main(this);
}
