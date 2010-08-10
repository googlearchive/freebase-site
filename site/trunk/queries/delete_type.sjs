var mf = acre.require("MANIFEST").MF;
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;
var h = mf.require("core", "helpers");

/**
 * Delete a type. If the type is being "used", throws an exception unless force == true.
 *
 * A type is "used" if one or more of the following is true:
 *   1. it has an instance count > 0, according to the activity bdb,
 *   2. it is expected by any property
 *
 * delete type by
 *   1. remove /type/type
 *   2. remove domain link
 *   3. remove keys from domain
 *   4. remove property expected type on properties you have permission on
 *   5. take note of the properties that you don't have permission on
 */
function delete_type(type_id, user_id, dry_run, force) {
  return type_info(type_id, user_id)
    .then(function(info) {
      if (info.instance_count ||
          info.expected_by.permitted.length ||
          info.expected_by.not_permitted.length) {

        console.log("use the force", info);
        if (dry_run) {
          return [info, null];
        }
        else if (!force) {
          throw deferred.rejected(JSON.stringify(info));
        }
      }

      var q = {
        guid: info.guid,
        type: {id: "/type/type", connect: "delete"},
        "/type/type/domain": {id: info.domain.id, connect: "delete"},
        key: [{namespace:k.namespace, value:k.value, connect: "delete"} for each (k in info.key)]
      };
      if (info.expected_by.permitted.length) {
        q["expected_by"] = [{id: eb.id, connect: "delete"} for each (eb in info.expected_by.permitted)];
      }
      return freebase.mqlwrite(q)
        .then(function(env) {
          return env.result;
        })
        .then(function(result) {
          // cleanup result
          result.domain = result["/type/type/domain"];
          return [info, result];
        });
    });
};

function type_info(type_id, user_id) {
  var promises = [];
  // get type instance counts
  var activity_id = type_id;
  promises.push(freebase.get_static("activity", activity_id)
    .then(function(activity) {
      return activity || {};
    })
    .then(function(activity) {
      if (activity.total) {
        return activity.total["new"] || 0;
      }
      return 0;
    }));
  // type info (domain, key, expected_by)
  promises.push(type_info_query(type_id, user_id));
  return deferred.all(promises)
    .then(function([count, info]) {
      info.instance_count = count;
      return info;
    });
};

function type_info_query(type_id, user_id) {
  var q = {
    id: type_id,
    guid: null,
    name: null,
    type: "/type/type",
    domain: {id: null, name: null},
    key: [{
      namespace: null,
      value: null
    }],
    // Get the properties that expect this type that you have permission on.
    // These links can be removed.
    expected_by: [{
      id: null,
      optional: true,
      permission: [{permits: [{member: {id: user_id}}]}]
    }],
    // opp: other people's properties
    // These cannot be removed
    "opp:expected_by": [{
      id: null,
      optional: true,
      permission:[{"permits": [{optional:"forbidden", member:{id: user_id}}]}]
    }]
  };
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result || {};
    })
    .then(function(result) {
      return {
        id: result.id,
        guid: result.guid,
        name: result.name,
        domain: result.domain,
        key: result.key,
        expected_by: {
          permitted: [p.id for each (p in result.expected_by)],
          not_permitted: [p.id for each (p in result["opp:expected_by"])]
        }
      };
    });
};
