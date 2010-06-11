var mf = acre.require("MANIFEST").MF;
var t = acre.require("template");
var queries = acre.require("queries");

var api = {

  projects: function(args, headers) {
    return queries.domain_membership(args.id)
      .then(function(domains) {
        return {
          data: domains,
          html: acre.markup.stringify(t.projects_toolbox(domains))
        };
      });
  },

  apps: function(args, headers) {
    var list_user_apps = acre.require("/freebase/apps/appeditor/list_user_apps", mf.version["/freebase/apps/appeditor"]).list_user_apps;
    var apps = list_user_apps(args.id, args.include_filenames);
    return {
      data: apps,
      html: acre.markup.stringify(t.apps_toolbox(apps))
    };
  },

  queries: function(args, headers) {
    return queries.user_queries(args.id)
      .then(function (result) {
        return {
          data: result,
          html: acre.markup.stringify(t.queries_toolbox(result))
        };
      });
  },

  schema: function(args, header) {
    return queries.type_membership(args.id)
      .then(function(types) {
        return {
          data: types,
          html: acre.markup.stringify(t.schema_toolbox(types))
        };
      });
  }

};

api.projects.args = ["id"];
api.apps.args = ["id"];
api.queries.args = ["id"];
api.schema.args = ["id"];

function main(scope) {
  var service = acre.require("/freebase/site/core/service", mf.version["/freebase/site/core"]);
  service.main(scope, api);
};

if (acre.current_script == acre.request.script) {
  main(this);
}
