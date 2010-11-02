var callback = acre.environ.params["callback"];
var worker = acre.require("worker");

var q = acre.environ.params["q"];

var infoQ = [{
  "id" : null,
  "guid" : null,
  "name" : null,
  "key" : [],
  "/type/property/schema" : [{
    "id" : null,
    "name" : null,
    "optional" : true
  }],
  "/type/property/expected_type" : [],
  "/type/property/unique" : null
}];

var o = acre.freebase.search(
  q + "*", 
  {
    type:        "/type/property",
    type_strict: "any",
    limit:       "10", 
    mql_output:  JSON.stringify(infoQ)
  }
);

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