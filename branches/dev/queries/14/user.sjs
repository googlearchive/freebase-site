var mf = acre.require("MANIFEST").MF;
var freebase = mf.require("promise", "apis").freebase;
var h = mf.require("helpers");

function user(id, badges) {
  var q = h.user_clause(id, badges);
  return freebase.mqlread(q)
    .then(function(result) {
      result = result.result;
      return result;
    });
};
