var callback = acre.environ.params["callback"];
var worker = acre.require("worker");

var t = acre.environ.params["t"];
var q = acre.environ.params["q"];

var infoQ = [{
  "id" : null,
  "guid" : null,
  "name" : null,
  "/common/topic/image" : [{ "optional" : true, "id" : null, "limit" : 1 }]
}];

var options = { 
  limit: "10", 
  mql_output: JSON.stringify(infoQ)
};
if (t.length > 0) {
  options.type = t;
  options.type_strict = 'any';
}

var o = acre.freebase.search(q + "*", options);

if (q.charAt(0) == "/") {
  infoQ[0]["id"] = q;
  try {
    var o2 = acre.freebase.mqlread(infoQ);
    if (o2.result.length > 0) {
      o.result.unshift(o2.result[0]);
    }
  } catch (e) {
  }
}

acre.start_response(200);
if (callback) {
  acre.write(callback + "(");
}
acre.write(JSON.stringify(o));
if (callback) {
  acre.write(")");
}