var extension_map = {
     mql  : 'mqlquery',
     mjt  : 'mjt',
     js   : 'passthrough',
     html : 'passthrough',
     gif  : 'binary',
     jpg  : 'binary',
     png  : 'binary'
};


var handlers = {
    
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
    },
    
    mqlquery : function(res){
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
    }
};

handlers.binary = handlers.passthrough;


function route(req) {
    var path_segs = req.url.replace(req.app_url, "").split("/");
    path_segs.shift();
    var filename = path_segs.shift() || "index";
    req.path_info = "/" + path_segs.join("/");
    var file_segs = filename.split('.');
    var ext = file_segs.length > 1 ? file_segs.pop() : "mjt";
    
    try {
        var res = acre.require(filename);
    } catch(e) {
        acre.response.status = 404;
        acre.exit();
    }
    
    var handler = extension_map[ext] || "passthrough";
    
    if (handler) {
        handlers[handler].apply(this);
    }
    acre.exit();
}

route(acre.request);
