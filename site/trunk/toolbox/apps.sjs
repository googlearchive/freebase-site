var mf = acre.require("MANIFEST").MF;
var service = acre.require("/freebase/libs/service/lib", mf.version["/freebase/libs/service"]);

function get_apps(user_id, include_filenames) {
  var list_user_apps = acre.require("/freebase/apps/appeditor/list_user_apps", mf.version["/freebase/apps/appeditor"]).list_user_apps;
  return list_user_apps(user_id, include_filenames);
};

function json(args) {
  service.GetService(function() {
    return {html: _html(args)};
  }, this);
};

function _html(args) {
  var apps = get_apps(args.id, args.include_filenames);
  var t = acre.require("template");
  return acre.markup.stringify(t.apps_toolbox(apps));
};

function html(args) {
  acre.write(_html(args));
};


function main() {
  var args = service.parse_request_args();
  if (args.json || args.callback) {
    json(args);
  }
  else {
    html(args);
  }
};

if (acre.current_script == acre.request.script) {
  main();
}
