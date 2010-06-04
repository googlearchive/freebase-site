var extension_map = {
  sjs  : "sjs",
  mjt  : 'mjt',
  mql  : 'mql',
  js   : 'passthrough',
  html : 'passthrough',
  css  : 'passthrough',
  less : 'passthrough',
  gif  : 'binary',
  jpg  : 'binary',
  png  : 'binary'
};


var handlers = {

  sjs : function(res) {
    console.log("sjs", res);
    if (typeof res.main === 'function') {
      console.log("sjs.main");
      res.main();
    }
    else if (res.acre.current_script.name.indexOf("test_") === 0) {
      console.log("sjs.test_report");
      res.acre.test.report();
    }
  },

  mjt : function(res) {
    var defs = res;

    // pkg is the TemplatePackage instance
    var pkg = defs._main.prototype.tpackage;

    // pkgtop is the rendered toplevel template
    var pkgtop = pkg.tcall;

    if (typeof pkgtop.doc_content_type != 'undefined') {
      acre.response.set_header('content-type', pkgtop.doc_content_type);
      acre.response.status = 200;
    } else {
      // template output defaults to html.
      acre.response.set_header('content-type', 'text/html');
      acre.response.status = 200;
    }

    acre.write(pkgtop);
  },

  mql : function(res){
    // support JSONP.  note that this means the callback= query argument
    //  is unavailable for modifying the query, which is fine in practice.
    var callback = null;
    if (typeof acre.request.params.callback == 'string') {
      callback = acre.request.params.callback;
      delete acre.request.params.callback;
    }

    var q = acre.freebase.extend_query(res.query, acre.request.params);

    acre.response.status = 200;
    if (callback !== null) {
      acre.response.set_header('content-type', 'text/javascript');
      acre.write(callback + '(');
    } else {
      acre.response.set_header('content-type', 'text/plain');
    }
    try {
      res = acre.freebase.mqlread(q);
      acre.write(JSON.stringify(res.result, null, 2));
    } catch (e) {
      acre.write(JSON.stringify(e.response, null, 2));
    }
    if (callback !== null)
      acre.write(')');
  },

  passthrough : function (res) {
    var ttl = 3600; // 1 hour
    if (res.headers) {
      for (var k in res.headers) {
        var v = res.headers[k];
        acre.response.set_header(k.toLowerCase(),v);
      }
    }
    acre.response.set_header_default('Cache-Control','public, max-age=' + ttl);
    acre.response.status = res.status;
    acre.write(res.body);
  }

};

handlers.binary = handlers.passthrough;

/**
 * Not like ordinary path split.
 *
 * /foo.bar/baz/fu => [foo.bar, /baz/fu]
 */
function split_path(path) {
  var path_segs = path.split("/");
  path_segs.shift();
  var script_id = path_segs.shift() || "index";
  return [script_id, "/" + path_segs.join("/")];
};

function split_extension(path) {
  var i = path.lastIndexOf(".");
  if (i !== -1) {
    return [path.substring(0, i), path.substring(i+1)];
  }
  return [path, "sjs"];
};

var NOT_FOUND = "Route require not found";

function do_route(req, script_id, version, path_info) {

  console.log("do_route", script_id, version, path_info);
  var [path, ext] = split_extension(script_id);

  // MONKEY PATCH
  var old_path_info = req.path_info;
  req.path_info = path_info || "/";

  try {
    console.log("do_route", "require", script_id, version);
    var res = acre.require(script_id, version);

    // MONKEY PATCH
    if (res.acre) {
      req.script = res.acre.current_script;
    }
  }
  catch (e if e.message === "Could not fetch data from " + script_id) {
    console.log("do_route", "NOT_FOUND", script_id, e);
    // reset path_info
    req.path_info = old_path_info;
    throw(NOT_FOUND);
  }

  if (typeof res._main === "function") {
    // is this a mjt template?
    ext = "mjt";
  }
  else if (typeof res.query === "object") {
    // is this a mql query?
    ext = "mql";
  }

  console.log("do_route", "handler", ext);
  var handler = handlers[extension_map[ext]];
  var args = [res];
  if (typeof handler === 'function') {
    handler.apply(this, args);
  }
};

function route(req) {
  var path = req.url.replace(req.app_url + req.base_path, "");
  var [script_id, path_info] = split_path(path);
  do_route(req, script_id, null, path_info);
}
