var mf = acre.require("MANIFEST").MF;
var queries = mf.require("queries");
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;

/**
 * Delete a property. If the property is being "used", throws an exception unless force=true.
 * You can also pass dry_run=true to see what will be deleted.
 *
 * A property is "used" if one or moer of the following is true:
 *   1. it has one or more /type/link instances with the property as the master or reverse property.
 *   2. it has an incoming /type/property/master_property link
 *   3. it has one or more incoming /type/property/delegated link
 *
 * Delete property by:
 *   1. remove /type/property
 *   2. remove schema link
 *   3. remove keys from type
 *   4. remove expected_type
 *   5. remove master_property
 *   6. remove incoming /type/property/master_property, if you have permission
 *   7. remove delegated
 *   8. remove incoming /type/property/delegated on properties you have permission on
 *
 * @param prop_id:String (required) - property id
 * @param user_id:String (required) - user id permitted to delete this type
 * @param dry_run:Boolean (optional) - don't write, just return what will be deleted.
 *                                     dry_run takes precedence over force.
 * @param force:Boolean (optional) - delete property even if type is being "used"
 * @throws prop_info:Object if force != true and property is being "used".
 * @return a tuple [prop_info, result] where prop_info is what was deleted
 * and result is the mqlwrite result of deleting the property.
 */
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
        "/type/property/schema": {id: info.schema.id, connect:"delete"},
        "/dataworld/gardening_task/async_delete": {value:true, connect:"update"}
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
        q["/type/property/reverse_property"]  = {id:info.reverse_property.permitted.id, connect:"delete"};
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

/**
 * Undo delete_property.
 *
 * @param prop_info:Object (required) - the prop info returned by delete_property
 */
function undo(prop_info) {
  var q = {
    guid: prop_info.guid,
    type: {id: "/type/property", connect: "insert"},
    "/type/property/schema": {id: prop_info.schema.id, connect: "update"},
    "/dataworld/gardening_task/async_delete": {value:true, connect:"delete"}
  };
  if (prop_info.key.length) {
    q.key = [{namespace:k.namespace, value:k.value, connect:"insert"} for each (k in prop_info.key)];
  }
  if (prop_info.expected_type) {
    q["/type/property/expected_type"] = {id:prop_info.expected_type.id, connect:"update"};
  }
  if (prop_info.master_property) {
    q["/type/property/master_property"] = {id:prop_info.master_property.id, connect:"update"};
  }
  if (prop_info.reverse_property.permitted) {
    q["/type/property/reverse_property"]  = {id:prop_info.reverse_property.permitted.id, connect:"update"};
  }
  if (prop_info.delegated) {
    q["/type/property/delegated"] = {id:prop_info.delegated.id, connect:"update"};
  }
  if (prop_info.delegated_by.permitted.length) {
    q["!/type/property/delegated"] = [{id:d.id, connect:"insert"} for each (d in prop_info.delegated_by.permitted)];
  }
  return freebase.mqlwrite(q)
    .then(function(env) {
      return env.result;
    })
    .then(function(result) {
      // cleanup result
      result.schema = result["/type/property/schema"];
      result.expected_type = result["/type/property/expected_type"];
      result.master_property = result["/type/property/master_property"];
      result.reverse_property = result["/type/property/reverse_property"];
      result.delegated = result["/type/property/delegated"];
      return [prop_info, result];
    });
};


function prop_info(prop_id, user_id) {
  var promises = [];
  // prop info
  promises.push(prop_info_query(prop_id, user_id));
  // prop used?
  promises.push(queries.property_used(prop_id));
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
    "!/type/property/delegated": [{
      id: null,
      optional: true,
      permission: [{permits: [{member: {id: user_id}}]}]
    }],
    "!opp:/type/property/delegated": [{
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
      var info = {
        id: result.id,
        guid: result.guid,
        name: result.name,
        schema: result.schema,
        key: [{namespace:k.namespace.id, value:k.value} for each (k in result.key)],
        expected_type: result.expected_type ? {id:result.expected_type.id} : null,
        master_property: result.master_property ? {id:result.master_property.id} : null,
        reverse_property: {
          permitted: result.reverse_property ? {id:result.reverse_property.id} : null,
          not_permitted: result["opp:reverse_property"] ? {id:result["opp:reverse_property"].id} : null
        },
        delegated: result.delegated ? {id:result.delegated.id} : null,
        delegated_by: {
          permitted:  [{id:d.id} for each (d in result["!/type/property/delegated"])],
          not_permitted: [{id:d.id} for each (d in result["!opp:/type/property/delegated"])]
        }
      };
      return info;
    });
};
