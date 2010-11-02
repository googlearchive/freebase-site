var mf = acre.require("MANIFEST").MF;
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;

/**
 * Any /type/property specific queries should go here.
 */

/**
 * Query to determine if a property is being "used".
 * A property is determined as being "used" if there is 1 or more
 * /type/link instances with a master_property or reverse_property of the property id.
 */
function used(prop_id) {
  var promises = [];
  var master_query = {
    source: null,
    target: null,
    target_value: null,
    type: "/type/link",
    master_property: prop_id,
    limit: 1
  };
  promises.push(freebase.mqlread(master_query)
    .then(function(env) {
      return env.result;
    }));

  var reverse_query = {
    source: null,
    target: null,
    target_value: null,
    type: "/type/link",
    master_property: {reverse_property: prop_id},
    limit: 1
  };
  promises.push(freebase.mqlread(reverse_query)
    .then(function(env) {
      return env.result;
    }));

  return deferred.all(promises)
    .then(function(results) {
      for (var i=0,l=results.length; i<l; i++) {
        if (results[i] != null) {
          return true;
        }
      }
      return false;
    });
};
