var mf = acre.require("MANIFEST").mf;
var h = mf.require("routing", "helpers");

var query_string = acre.request.query_string;

/**
 * MQL to determine if acre.request.path_info is a domain, type or property.
 */
var q = {
  id: acre.request.path_info,
  "d:type": {id:"/type/domain", optional:true},
  "t:type": {id:"/type/type", optional:true},
  "p:type": {id:"/type/property", optional:true}
};

var result;
try {
  result = acre.freebase.mqlread(q).result;
}
catch (e) {
  result = null;
}
if (result) {
  if (result["d:type"]) {
    do_route_domain(result.id);
  }
  else if (result["t:type"]) {
    do_route_type(result.id);
  }
  else if (result["p:type"]) {
    do_route_property(result.id);
  }
  else {
    do_route_local();
  }
}
else {
  do_route_local();
}

function do_route(script, path_info) {
  var path = [acre.request.script.app.path, "/" + script, path_info, query_string ? "?" + query_string : ""];
  path = path.join("");
  console.log("routing", path);
  acre.route(path);
}

function do_route_domain(id) {
  do_route("domain", id);
};

function do_route_type(id) {
  do_route("type", id);
};

function do_route_property(id) {
  do_route("property", id);
};

function do_route_local() {
  var [script, path_info, qs] = h.split_path(acre.request.path_info);
  do_route(script, path_info);
};
