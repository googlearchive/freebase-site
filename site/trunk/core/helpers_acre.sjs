var exports = {
  "parse_path": parse_path
};

/**
 * Parses a path (either relative, graph ID or host-style) and resolves it into
 * metadata about that resource.
 *
 * Takes an optional options dict:x
 *   @param file (boolean) - hint whether resource is a file (graph ID style only)
 */
function parse_path(path, scope, options /* file : true|false */) {

  var DEFAULT_HOST_NS = "/freebase/apps/hosts";

  var ACRE_TO_FREEBASE_MAP = {
    "freebaseapps.com"           : "http://www.freebase.com",
    "sandbox-freebaseapps.com"   : "http://www.sandbox-freebase.com",
    "branch.qa-freebaseapps.com" : "http://branch.qa.metaweb.com",
    "trunk.qa-freebaseapps.com"  : "http://trunk.qa.metaweb.com"
  };

  options = options || {};
  var app_ver_id_parts;   // arrary used to manipulate appid/host components

  // structure of object we'll be returning
  var resource = {
    path        : null,
    id          : null,
    app_path    : null,
    appid       : null,
    version     : null,
    filename    : null,
    path_info   : "/",
    querystring : null,
    service_url : scope.acre.freebase.service_url,
    acre_host   : scope.acre.host.name + ((scope.acre.host.port !== 80) ? ":" + scope.acre.host.port : "")
  };

  // extract querystring, if present
  var qparts = path.split("?");
  if (qparts.length > 1) {
    resource.querystring = qparts[1];
    path = qparts[0];
  }

  // it's the new host-style styntax:
  if (path.indexOf("//") === 0) {

    // extract app host portion
    var bits = path.split('//');
    var parts = bits[1].split('/');
    var app_host_part = parts.shift();

    // extract filename and path_info, if present
    if (parts.length) {
      resource.filename = parts.pop();
      resource.path_info = "/" + parts.join("/");
    }

    // break-down app host so we can work with it
    app_ver_id_parts = app_host_part.split('.');

    // check whether it's cross-graph.  if so:
    // * change the service_url
    // * munge other values accordingly
    var acre_host_re = /\.(freebaseapps\.com|sandbox\-freebaseapps\.com|branch\.qa\-freebaseapps\.com|trunk\.qa\-freebaseapps\.com)\.$/;
    var match = app_host_part.match(acre_host_re);
    if(match) {
      resource.acre_host = match[1];
      resource.service_url = ACRE_TO_FREEBASE_MAP[resource.acre_host];
      app_host_part = app_host_part.replace(acre_host_re,"");
      app_ver_id_parts = app_host_part.split(".");
    }

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
      var host_base_parts = scope.acre.host.name.split('.');
      for (var a in host_base_parts) {
        app_ver_id_parts.unshift(host_base_parts[a]);
      }
      app_ver_id_parts.unshift(DEFAULT_HOST_NS);
      break;

    }
    resource.app_path = app_host_part;
    resource.appid = app_ver_id_parts.join('/');


    // it's an old-style graph ID
  } else if (path.indexOf("/") === 0) {

    var parts = path.split("/");
    if (options.file) {
      resource.filename = parts.pop();
      // NOTE: this mode does not support path_info (ambiguous)
    }
    resource.appid = parts.join('/');
    resource.app_path = resource.appid.split("/").reverse().join(".") + "dev";


    // it's a relative path
  } else {
    resource.appid = scope.acre.current_script.app.id;
    resource.version = scope.acre.current_script.app.version;
    resource.app_path = (resource.version ? resource.version + "." : "" ) +
                        resource.appid.split("/").reverse().join(".") + "dev";

    // extract filename and path_info, if present
    var parts = path.split("/");
    if (parts.length) {
      resource.filename = parts.pop();
      resource.path_info = "/" + parts.join("/");
    }
  }

  resource.id = resource.appid + (resource.filename ? "/" + resource.filename : "");
  resource.path = "//" + resource.app_path + (resource.filename ? "/" + resource.filename : "");

  return resource;
};
