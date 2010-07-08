var mf = acre.require("MANIFEST").MF;
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;
var h = mf.require("helpers");

function user(id, badges) {
  var q = h.user_clause(id, badges);
  return freebase.mqlread(q)
    .then(function(result) {
      return result.result;
    });
};
