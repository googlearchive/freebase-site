var mf = acre.require("MANIFEST").MF;
var t = mf.require("template");
var queries = mf.require("queries");
var h = mf.require("core", "helpers");

var api = {

  projects: function(args, headers) {
    return queries.domain_membership(args.id)
      .then(function(domains) {
        return {
          context: args.context,
          data: domains,
          html: acre.markup.stringify(t.projects_toolbox(domains))
        };
      });
  },

  apps: function(args, headers) {
      var list_user_apps = mf.require("appeditor", "list_user_apps").list_user_apps;
    var apps = list_user_apps(args.id, args.include_filenames);
    return {
      context: args.context,
      data: apps,
      html: acre.markup.stringify(t.apps_toolbox(apps))
    };
  },

  queries: function(args, headers) {
    return queries.user_queries(args.id)
      .then(function (result) {
        return {
          context: args.context,
          data: result,
          html: acre.markup.stringify(t.queries_toolbox(result))
        };
      });
  },

  schema: function(args, header) {
    return queries.type_membership(args.id)
      .then(function(types) {
        return {
          context: args.context,
          data: types,
          html: acre.markup.stringify(t.schema_toolbox(types))
        };
      });
  }

};

api.projects.args = ["id", "context"];
api.apps.args = ["id", "context"];
api.queries.args = ["id", "context"];
api.schema.args = ["id", "context"];

function main(scope) {
  if (h.is_client()) {
    acre.response.set_cache_policy('fast');
  }
  var service = mf.require("core", "service");
  service.main(scope, api);
};

if (acre.current_script == acre.request.script) {
  main(this);
}
