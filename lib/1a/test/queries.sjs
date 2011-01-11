var mf = acre.require("MANIFEST").mf;
var freebase = mf.require("promise/apis").freebase;

function test_query(id) {
  return freebase.mqlread({id: id, name:null, type:[{id:null, name:null}]})
    .then(function(env) {
      return env.result;
    });
};
