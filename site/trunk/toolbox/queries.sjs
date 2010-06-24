var mf = acre.require("MANIFEST").MF;
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;

/**
 * Get all domains user_id is an admin of AND member of (/freebase/user_profile/favorite_domains)
 */
function domain_membership(user_id) {
  var q_admin = acre.freebase.extend_query(mf.require("admin_domains").query, {id: user_id});
  var q_fav = acre.freebase.extend_query(mf.require("fav_domains").query, {id: user_id});

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

/**
 * Get all types user_id is an admin of AND member of (/freebase/user_profile/favorite_types)
 */
function type_membership(user_id) {
  var q_admin = acre.freebase.extend_query(mf.require("admin_types").query, {id: user_id});
  var q_fav = acre.freebase.extend_query(mf.require("fav_types").query, {id: user_id});

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


function user_queries(user_id) {
  var q = acre.freebase.extend_query(mf.require("user_queries").query, {creator:user_id});
  return freebase.mqlread(q)
    .then(function(result) {
      return result.result;
    });
};
