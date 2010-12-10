/*
*
* See http://service.freebaseapps.com/ for documentation
*
*/


////////////////////
//                //
//    Utilities   //
//                //
////////////////////


function check_user() {
  var options = {
    mql_output : {
      type : "/freebase/user_profile",
      guid : null,
      name : null,
      my_full_name : null,
      "!/type/usergroup/member" : {
        id : "/freebase/mwstaff",
        optional : true
      }
    }
  };
  
  var r = acre.freebase.get_user_info(options);
  
  if (!r) {
    throw new ServiceError("401 User Authorization Required", "/api/status/error/auth", {
      message: "User must be logged in to use this service.",
      code : "/api/status/error/auth/required"
    });
  }
  
  var result = r.result;
  delete r.result;
  
  return {
    status          : r.status,
    code            : r.code,
    id              : result.id,
    guid            : result.guid,
    username        : result.name,
    name            : result.my_full_name,
    is_staff        : (result["!/type/usergroup/member"] ? true : false),
    transaction_id  : r.transaction_id
  };
}


function parse_request_args(required_args) {
    var req = acre.request;

    // accept params in either the query string (GET) or body (POST)
    var args = {};
    for (var name in req.params) {
        args[name] = req.params[name];
    }    
    for (var name in req.body_params) {
        args[name] = req.body_params[name];
    }

    for each (var key in required_args) {
        if (!(key in args)) {
            throw new ServiceError("400 Bad Request", null, {
                message : "Missing " + key + " argument",
                code    : "/api/status/error/input/validation",
                info    : key
            });
        }
    }

    return args;
}


function convert_args(args, convs) {
  for (var a in convs) {
    if (a in args) {
      if (typeof convs[a] === 'function') {
        args[a] = convs[a](args[a]);
      } else if (convs[a] === 'json') {
          try {
              args[a] = JSON.parse(args[a]);
          } catch(e) {
              // just return as string;
          }
      } else if (convs[a] === 'int') {
        args[a] = parseInt(args[a], 10);
      } else if (convs[a] === 'string') {
        args[a] = args[a];
      }
    }
  }
  return args;
}


function parse_freebase_error(error) {
    try {
        var o = JSON.parse(error.response.body);
        return o;
    } catch (e) {
        return false;
    }
}


function handle_freebase_response(req) {
    var result = JSON.parse(req.body);

    if (result.status != "200 OK" || result.code != "/api/status/ok") {

        var message;
        if (result.status != "200 OK") {
            message    = 'HTTP error: ' + result.status;
        } else if ('message' in result.messages[0]) {
            message    = result.code + ': ' + result.messages[0].message;
        } else {
            message    = result.code;
        }

        var exception      = new acre.freebase.Error(message);
        exception.response = result;
        exception.info     = result;
        throw exception;
    }

    return result;
}


function run_template(tfile, template, args) {
    var temps = acre.require(tfile);
    var t = temps[template](args);
    return acre.markup.stringify(t);
}


// HACK - necessary when doing as_of_time queries because of MQL's ID cache
function decompose_id(id) {
    var segs = id.split("/");
    var key = segs.pop();
    var path = segs.join("/");

    if (segs.length) {
        return {
            key : {
                value: key,
                namespace: decompose_id(path)                
            }
        }
    } else {
        return "/";
    }
}


function escape_re(s) {
  var specials = /[.*+?|()\[\]{}\\]/g;
  return s.replace(specials, '\\$&');
}


function parse_path(path, options /* file : true|false */) {

  var DEFAULT_HOST_NS = "/freebase/apps/hosts";
  
  var APPEDITOR_SERVICE_PATH = "/appeditor/service/"

  var ACRE_TO_FREEBASE_MAP = {
    "freebaseapps.com"           : {
        service_url : "http://api.freebase.com",
        site_host   : "http://www.freebase.com"
    },
    "sandbox-freebaseapps.com"   : {
        service_url : "http://api.sandbox-freebase.com",
        site_host   : "http://www.sandbox-freebase.com"
    },
    "acre.z:8115"                : {
        service_url : "http://api.sandbox-freebase.com",
        site_host   : "http://devel.sandbox-freebase.com:8115"
    }
  };
  
  var hosts = [];
  for (var host in ACRE_TO_FREEBASE_MAP) {
      hosts.push(escape_re(host));
  }
  var acre_host_re = new RegExp("\.(" + hosts.join("|") +")\.$");
  
  options = options || {};
  var app_ver_id_parts;   // arrary used to manipulate appid/host components

  // structure of object we'll be returning
  var acre_host = acre.host.name + ((acre.host.port !== 80) ? ":" + acre.host.port : "");
  var freebase_urls = ACRE_TO_FREEBASE_MAP[acre_host];
  var resource = {
    path        : null,
    id          : null,
    app_path    : null,
    appid       : null,
    version     : null,
    filename    : null,
    path_info   : "/",
    querystring : null,
    service_url : freebase_urls ? freebase_urls.service_url : acre.freebase.service_url,
    site_host   : freebase_urls ? freebase_urls.site_host : acre.freebase.site_host,
    acre_host   : acre_host
  };
  resource.appeditor_service_base = resource.site_host + APPEDITOR_SERVICE_PATH;

  if (typeof path === 'undefined') return resource;
  if (typeof path !== 'string') {
      throw "Can't parse a path that is not a string."
  }

  // extract querystring, if present
  var qparts = path.split("?");
  if (qparts.length > 1) {
    resource.querystring = qparts[1];
  }
  
  var base_path = qparts[0];
  
  var bits = base_path.split("//");

  // it's the new URL-style styntax:
  if (bits.length === 2) {
    // extract app host portion
    var parts = bits[1].split('/');
    var app_host_part = parts.shift();

    // extract filename and path_info, if present
    if (parts.length) {
      resource.filename = parts.pop();
      resource.path_info = "/" + parts.join("/");
    }
    // Resolve whether source is x-graph.  If it is:
    // * change the service_url
    // * munge other values accordingly
    if (/^https?:$/.test(bits[0])) {
        // For URLs, do a HEAD request to find out from acre where the source really is (post-routing)
        var req = acre.urlfetch(path, {method : "HEAD"});
        var source_url = req.headers['x-acre-source-url'];
        if (!source_url) return resource;

        var ae_host = /^https?:\/\/([^\/]*)/.exec(source_url);
        if (ae_host) {
            for (var host in ACRE_TO_FREEBASE_MAP) {
                var freebase_urls = ACRE_TO_FREEBASE_MAP[host];
                if (freebase_urls.site_host = ae_host[0]) {
                    resource.acre_host = host;
                }
            }
        }
        var app_host_res = /\#\!path=\/\/([^\/]*)/.exec(source_url);
        if (app_host_res) app_host_part = app_host_res[1];
    } else {
        // check whether path given is cross-graph
        var match = app_host_part.match(acre_host_re);
        if(match) {
            resource.acre_host = match[1];
            app_host_part = app_host_part.replace(acre_host_re,"");
        } 
    }
      
    // break-down app host so we can work with it
    app_ver_id_parts = app_host_part.split('.');

    // construct fully-qualified versioned appid and app_host
    switch (app_ver_id_parts[app_ver_id_parts.length-1]) {

    case "dev" :   // ends in '.dev' so it's fully-qualified ID
      app_ver_id_parts.pop();
      app_ver_id_parts.reverse().unshift("");
      break;

    case "" :      // ends in '.' so it's a full-qualified hostname
      app_ver_id_parts.pop();
      app_ver_id_parts.reverse().unshift(DEFAULT_HOST_NS);
      break;

    default :     // otherwise, it's a 'published' hostname
      app_ver_id_parts = app_ver_id_parts.reverse();
      var host_base_parts = acre.host.name.split('.');
      for (var a in host_base_parts) {
        app_ver_id_parts.unshift(host_base_parts[a]);
      }
      app_ver_id_parts.unshift(DEFAULT_HOST_NS);
      break;

    }

    resource.app_path = "//" + app_host_part;
    resource.appid = app_ver_id_parts.join('/');

    // it's an old-style graph ID
  } else if (/^(freebase:)?\//.test(path)) {

    var parts = path.replace(/^freebase:/,"").split('/');
    if (options.file) {
      resource.filename = FB.mqlkey_unquote(parts.pop());
      // NOTE: this mode does not support path_info (ambiguous)
    }
    resource.appid = parts.join('/');
    resource.app_path = "//" + resource.appid.split("/").reverse().join(".") + "dev";


  // it's a relative path
  } else {
    resource.appid = acre.current_script.app.id;
    resource.version = acre.current_script.app.version;
    resource.app_path = (resource.version ? resource.version + "." : "" ) +
                        resource.appid.split("/").reverse().join(".") + "dev";

    // extract filename and path_info, if present
    var parts = base_path.split("/");
    if (parts.length) {
      resource.filename = parts.pop();
      resource.path_info = "/" + parts.join("/");
    }
  }

  resource.id = resource.appid + (resource.filename ? "/" + FB.mqlkey_quote(resource.filename) : "");
  resource.path = resource.app_path + (resource.filename ? "/" + resource.filename : "");
  resource.url = acre.host.protocol + ":" + resource.app_path + "." + acre.host.name + 
                (acre.host.port !== 80 ? (":" + acre.host.port) : "") +
                (resource.filename ? "/" + resource.filename : "");

  return resource;
};



////////////////////////////
//                        //
//   Service Definition   //
//                        //
////////////////////////////


function ServiceResult(result) {
    this.status = "200 OK";
    this.code = "/api/status/ok";
    this.result = result;
}


function ServiceError(status, code) {
    // NOTE: any number of message objects can be passed as additional arguments

    this.status = status || "500 Internal Server Error";
    this.code = code || "/api/status/error";

    this.messages = [];
    var messages = Array.prototype.slice.call(arguments, 2);

    for each (var msg in messages) {
        if (typeof msg.code    == 'undefined') { msg.code    = null; }
        if (typeof msg.message == 'undefined') { msg.message = null; }
        if (typeof msg.info    == 'undefined') { msg.info    = null; }
        this.messages.push(msg);
    }
}


function output_response(ret, mode) {

    // update transaction id and extract the timestamp from it
    var tid = acre.request.headers['x-metaweb-tid'];
    if (tid) {
        ret.transaction_id = tid;
        ret.timestamp = (tid.split(';')[2].match(/.*Z$/) || [null])[0];        
    } else {
        ret.transaction_id = "Doh!  Sorry, no transaction id available."
    }
    
    if (mode == "form") {
        // TODO - WebKit nightlies don't seem to like this
        // acre.response.set_header('content-type', 'text/html; charset=utf-8');
        acre.write(JSON.stringify(ret, null, 2));
    } else {
        var callback = acre.request.params.callback;
        if (callback) {
            acre.response.set_header('content-type', 'text/javascript; charset=utf-8');    
            acre.write(callback, '(', JSON.stringify(ret, null, 2), ');');
        } else {
            // only set non-200 status code if not in a JsonP request or Form request
            acre.response.set_header('content-type', 'text/plain; charset=utf-8'); 
            var status_code = parseInt(ret.status.split(' ')[0]);
            if (status_code) {
                acre.response.status = status_code;
            }
            acre.write(JSON.stringify(ret, null, 2));
        }
    }

    acre.exit();
}


function run_function_as_service(func, scope, args) {
    var ret = null;

    try {
        var result = func.apply(scope, args);
        ret = new ServiceResult(result);

    } catch (e if e instanceof ServiceError) {
        // it's an already handled error
        ret = e;

    } catch(e if e instanceof acre.freebase.Error) {
        // it's an acre.freebase error so pass along original error from Freebase
        ret = e.response;

    } catch(e if e instanceof acre.errors.URLError) {
        // it's an unknown urlfetch error so parse it
        var response = e.response.body;
        var info = e.response;

        try {
            // is it a JSON-formatted error?
            info = JSON.parse(response);
        } catch(e) {
            // otherwise just package the response as string
            info = response;
        }

        var msg = e.request_url ? "Error fetching " + e.request_url : "Error fetching external URL";
        ret =  new ServiceError("500 Service Error", null, {
            message: msg,
            code : "/api/status/error/service/external",
            info :info
        });

    } catch(e if typeof e === 'string') {
        // it's just a message string, which is a convenience for throwing validation errors
        ret = new ServiceError("400 Bad Request", null, {
            message: e,
            code : "/api/status/error/input/validation"
        });

    }
    // otherwise, let it fallthrough to error page to wrap the JS call stack

    return ret;
}


function dump_error(e) {
    var msg = e.message + " (" + e.filename + ", line: " + e.line + ")";

    var ret = new ServiceError("500 Service Error", null, {
        message: msg,
        code: '/api/status/error/javascript',
        info: e
    });

    output_response(ret);
}


function GetService(func, scope, args) {

    output_response(run_function_as_service(func, scope, args), "get");

}


function FormService(func, scope, args) {

    // referrer url security check?
    // ideally... provide a token generation and validation mechanism

    output_response(run_function_as_service(func, scope, args), "form");
}


function PostService(func, scope, args) {

    if (!(acre.request.method == "POST")) {
        return output_response(new ServiceError("405 Method Not Allowed", null, {
            message: "Request method must be POST",
            code: "/api/status/error/request/method"
        }));
    }

    if (!acre.request.headers['x-requested-with']) {
        return output_response(new ServiceError("400 Bad Request", null, {
            message: "Request must include 'X-Requested-With' header",
            code: "/api/status/error/request/method"
            }));
    }

    output_response(run_function_as_service(func, scope, args), "post");
}

