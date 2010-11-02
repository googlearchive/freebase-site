var mf = acre.require("MANIFEST").mf;
var h = mf.require("routing", "helpers");

/**
 * Check to see if path_info is a valid mql id
 */
var q = {
  id: acre.request.path_info
};
var result;
try {
  result = acre.freebase.mqlread(q).result;
}
catch(e) {
  result = null;
}

if (result) {
  do_route_index(result.id);
}
else {
  do_route_local();
}

function do_route(script, path_info) {
  var query_string = acre.request.query_string;
  var path = [acre.request.script.app.path, "/" + script, path_info, query_string ? "?" + query_string : ""];
  path = path.join("");
  acre.route(path);
};


function do_route_index(id) {
  do_route("index", id);
};

function do_route_local() {
  var [script, path_info, qs] = h.split_path(acre.request.path_info);
  do_route(script, path_info);
};
