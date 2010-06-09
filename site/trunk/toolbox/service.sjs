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
  }

};

api.apps.args = ["id"];
api.apps.auth = true;


function main(scope) {
  var service = acre.require("/freebase/site/core/service", mf.version["/freebase/site/core"]);
  service.main(scope, api);
};

if (acre.current_script == acre.request.script) {
  main(this);
}
