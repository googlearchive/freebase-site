var mf = acre.require("MANIFEST").MF;
var t = acre.require("template");
var deferred = acre.require("/freebase/site/promise/deferred", mf.version["/freebase/site/promise"]);
var freebase = acre.require("/freebase/site/promise/apis", mf.version["/freebase/site/promise"]).freebase;

function domain_membership(user_id) {
  var q = acre.require("domains").query;
  q = acre.freebase.extend_query(q, {id: user_id});

  function callback(result) {
    result = result.result;
    var admin_of = [];
    var member_of = [];
    result["!/type/usergroup/member"].forEach(function(m) {
      m["!/type/domain/owners"].forEach(function(d) {
        admin_of.push({id:d.id, name:d.name});
      });
    });
    result["/freebase/user_profile/favorite_domains"].forEach(function(d) {
      member_of.push({id:d.id, name:d.name});
    });
    return [admin_of, member_of];
  };
  return freebase.mqlread(q).then(callback);
};


function type_membership(user_id) {
  var q = acre.require("domains").query;
  delete q["/freebase/user_profile/favorite_domains"];

  var type_clause = [{
    "id": null,
    "name": null,
    "type": "/type/type",
    "sort": "name",
    "optional": true
  }];
  q["!/type/usergroup/member"][0]["!/type/domain/owners"][0].types = type_clause;
  q["/freebase/user_profile/favorite_types"] = type_clause;

  function callback(result) {
    result = result.result;
    var admin_of = [];
    var member_of = [];
    result["!/type/usergroup/member"].forEach(function(m) {
      m["!/type/domain/owners"].forEach(function(d) {
        d["types"].forEach(function(t) {
          admin_of.push({id:t.id, name:t.name});
        });
      });
    });
    result["/freebase/user_profile/favorite_types"].forEach(function(t) {
      member_of.push({id:t.id, name:t.name});
    });
    return [admin_of, member_of];
  };
  return freebase.mqlread(q).then(callback);
};


var api = {

  projects: function(args, headers) {
    return domain_membership(args.id)
      .then(function([admin_of, member_of]) {
              var domains = admin_of.concat(member_of);
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
    function callback(result) {
      result = result.result;
      return {
        data: result,
        html: acre.markup.stringify(t.queries_toolbox(result))
      };
    };
    var q = acre.freebase.extend_query(acre.require("queries").query, {creator:args.id});
    return freebase.mqlread(q).then(callback);
  },

  schema: function(args, header) {
    return type_membership(args.id)
      .then(function([admin_of, member_of]) {
              var types = admin_of.concat(member_of);
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
