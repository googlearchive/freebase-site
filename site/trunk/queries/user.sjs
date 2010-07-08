var mf = acre.require("MANIFEST").MF;
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;
var h = mf.require("helpers");

function user(id, badges) {
  var q = h.user_clause(id, badges);
  return freebase.mqlread(q)
    .then(function(result) {
      result = result.result;
      if (result["/common/topic/image"]) {
        result["image"] = result["/common/topic/image"];
        delete result["/common/topic/image"];
      }
      if (result["badges:/type/user/usergroup"]) {
        result["badges"] = result["badges:/type/user/usergroup"];
        delete result["badges:/type/user/usergroup"];
      }
      return result;
    });
};
