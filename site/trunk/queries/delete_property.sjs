var mf = acre.require("MANIFEST").MF;
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;


function delete_property(prop_id, user_id, dry_run, force) {

  return prop_info(prop_id, user_id)
    .then(function(info) {
      if (dry_run) {
        return [info, null];
      }
      if (!force &&
          (info.used ||
           info.reverse_property.permitted ||
           info.reverse_property.not_permitted ||
           info.delegated_by.permitted.length ||
           info.delegated_by.not_permitted.length)) {
        throw deferred.rejected(JSON.stringify(info));
      }
      var q = {
        guid: info.guid,
        type: {id: "/type/property", connect: "delete"},
        "/type/property/schema": {id: info.schema.id, connect:"delete"}
      };
      if (info.key.length) {
        q.key = [{namespace:k.namespace, value:k.value, connect:"delete"} for each (k in info.key)];
      }
      if (info.expected_type) {
        q["/type/property/expected_type"] = {id:info.expected_type.id, connect:"delete"};
      }
      if (info.master_property) {
        q["/type/property/master_property"] = {id:info.master_property.id, connect:"delete"};
      }
      if (info.reverse_property.permitted) {
        q["/type/property/reverse_property"]  = {id:info.reverse_property.permitted, connect:"delete"};
      }
      if (info.delegated) {
        q["/type/property/delegated"]  = {id:info.delegated.id, connect:"delete"};
      }
      if (info.delegated_by.permitted.length) {
        q["!/type/property/delegated"] = [{id:d.id, connect:"delete"} for each (d in info.delegated_by.permitted)];
      }

      return freebase.mqlwrite(q)
        .then(function(env) {
          return env.result;
        })
        .then(function(result) {
          result.schema = result["/type/property/schema"];
          result.expected_type = result["/type/property/expected_type"];
          result.master_property = result["/type/property/master_property"];
          result.reverse_property = result["/type/property/reverse_property"];
          result.delegated = result["/type/property/delegated"];
          return [info, result];
        });
    });

};


function prop_info(prop_id, user_id) {
  var promises = [];
  // prop info
  promises.push(prop_info_query(prop_id, user_id));
  // prop used?
  promises.push(mf.require("property").used(prop_id));
  return deferred.all(promises)
    .then(function([info, used]) {
      info.used = used;
      return info;
    });
};

function prop_info_query(prop_id, user_id) {
  var q = {
    id: prop_id,
    guid: null,
    name: null,
    type: "/type/property",
    schema: {id: null, name: null},
    key: [{
      optional: true,
      namespace: {
        id: null,
        permission: [{permits: [{member: {id: user_id}}]}]
      },
      value: null
    }],
    expected_type: {
      id: null,
      optional: true
    },
    master_property: {
      id: null,
      optional: true
    },
    reverse_property: {
      id: null,
      optional: true,
      permission: [{permits: [{member: {id: user_id}}]}]
    },
    "opp:reverse_property": {
      id: null,
      optional: true,
      permission:[{"permits": [{optional:"forbidden", member:{id: user_id}}]}]
    },
    delegated: {
      id: null,
      optional: true
    },
    "!/type/property/delegated": {
      id: null,
      optional: true,
      permission: [{permits: [{member: {id: user_id}}]}]
    },
    "!opp:/type/property/delegated": {
      id: null,
      optional: true,
      permission:[{"permits": [{optional:"forbidden", member:{id: user_id}}]}]
    }
  };
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result || {};
    })
    .then(function(result) {
      var info = {
        id: result.id,
        guid: result.guid,
        name: result.name,
        schema: result.schema,
        key: [{namespace:k.namespace.id, value:k.value} for each (k in result.key)],
        expected_type: result.expected_type,
        master_property: result.master_property,
        reverse_property: {
          permitted: result.reverse_property ? result.reverse_property.id : null,
          not_permitted: result["opp:reverse_property"] ? result["opp:reverse_property"].id : null
        },
        delegated: result.delegated,
        delegated_by: {
          permitted: [d.id for each (d in result["!/type/property/delegated"])],
          not_permitted: [d.id for each (d in result["!opp:/type/property/delegated"])]
        }
      };
      return info;
    });
};
