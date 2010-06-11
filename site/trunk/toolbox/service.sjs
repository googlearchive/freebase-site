var mf = acre.require("MANIFEST").MF;
var t = acre.require("template");
var deferred = acre.require("/freebase/site/promise/deferred", mf.version["/freebase/site/promise"]);
var freebase = acre.require("/freebase/site/promise/apis", mf.version["/freebase/site/promise"]).freebase;

function domain_membership(user_id) {
  var q_admin = acre.freebase.extend_query(acre.require("admin_domains").query, {id: user_id});
  var q_fav = acre.freebase.extend_query(acre.require("fav_domains").query, {id: user_id});

  function callback([r_admin, r_fav]) {
    var r_admin = r_admin.result;
    var r_fav = r_fav.result;

    var map = {};

    if (r_admin) {
      r_admin["!/type/usergroup/member"].forEach(function(m) {
        m["!/type/domain/owners"].forEach(function(d) {
          map[d.id] = {id:d.id, name:d.name, admin:true};
        });
      });
    }
    if (r_fav) {
      r_fav["/freebase/user_profile/favorite_domains"].forEach(function(d) {
        if (! (d.id in map)) {
          map[d.id] = {id:d.id, name:d.name};
        }
      });
    }
    var domains = [];
    for (var k in map) {
      domains.push(map[k]);
    }
    domains.sort(function(a,b) {
      return a.name > b.name;
    });
    return domains;
  };

  var d_admin = freebase.mqlread(q_admin);
  var d_fav = freebase.mqlread(q_fav);

  return deferred.all([d_admin, d_fav]).then(callback);
};


function type_membership(user_id) {
  var q_admin = acre.freebase.extend_query(acre.require("admin_types").query, {id: user_id});
  var q_fav = acre.freebase.extend_query(acre.require("fav_types").query, {id: user_id});

  function callback([r_admin, r_fav]) {
    var r_admin = r_admin.result;
    var r_fav = r_fav.result;

    var map = {};

    if (r_admin) {
      r_admin["!/type/usergroup/member"].forEach(function(m) {
        m["!/type/domain/owners"].forEach(function(d) {
          d["types"].forEach(function(t) {
            map[t.id] = {id:t.id, name:t.name, admin:true};
          });
        });
      });
    }
    if (r_fav) {
      r_fav["/freebase/user_profile/favorite_types"].forEach(function(t) {
        if (! (t.id in map)) {
          map[t.id] = {id:t.id, name:t.name};
        }
      });
    }
    var types = [];
    for (var k in map) {
      types.push(map[k]);
    }
    types.sort(function(a,b) {
      return a.name > b.name;
    });
    return types;
  };

  var d_admin = freebase.mqlread(q_admin);
  var d_fav = freebase.mqlread(q_fav);

  return deferred.all([d_admin, d_fav]).then(callback);
};


var api = {

  projects: function(args, headers) {
    return domain_membership(args.id)
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
