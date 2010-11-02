
var mf = acre.require("MANIFEST").MF;
var freebase = mf.require("promise", "apis").freebase;

/**
 * Any /type/type specific queries should go here.
 */


/**
 * Get all included types of a type
 */
function included_types(id) {
  return freebase.mqlread({
    id: id,
    "/freebase/type_hints/included_types": [{
      optional: true,
      id: null,
      name: null,
      type: "/type/type",
      index: null,
      sort: "index",
      "!/freebase/domain_profile/base_type": {optional: "forbidden", id: null, limit: 0}
    }]
  })
  .then(function(env) {
    return env.result;
  })
  .then(function(result) {
    var types = result["/freebase/type_hints/included_types"];
    return [{id: t.id, name: t.name} for each (t in types)];
  });
};
