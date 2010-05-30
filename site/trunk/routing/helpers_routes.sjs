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
    console.log("sjs");
    if (typeof res.main === 'function') {
      console.log("sjs.main");
      res.main();
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
      res = _system_freebase.mqlread(q);
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
 * /foo.bar/baz/fu => [foo, bar, /baz/fu]
 */
function split_path(path) {
  var path_segs = path.split("/");
  path_segs.shift();
  var filename = path_segs.shift() || "index";
  var file_segs = filename.split('.');
  var ext = file_segs.length > 1 ? file_segs.pop() : "sjs";
  return [filename, ext, "/" + path_segs.join("/")];
};

var ERROR_NOT_FOUND = "Route require not found";

function do_route(req, path, app_id, version) {
  console.log("do_route", path, app_id, version);
  var [filename, ext, path_info] = split_path(path);
  
  var id = filename;
  if (app_id) {
    id = app_id + "/" + filename;
  }

  // MONKEY PATCH
  req.path_info = path_info;

  try {
    console.log("do_route", "require", id, version);
    var res = acre.require(id, version);

    // MONKEY PATCH
    if (res.acre) {
      req.script = res.acre.current_script;
    }
  }
  catch (e) {
    console.log("do_route", "require", "error", e);
    if (e && typeof e === "object" && e.message === "Could not fetch data from " + id) {
      throw(ERROR_NOT_FOUND);
    }
    else {
      throw(e);
    }
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
  do_route(req, path);
}
