var __all__ = [
  "is_client",
  "account_url",
  "app_url",
  "freebase_static_resource_url",
  "resource_url",
  "url_for"
];

var mf = acre.require("MANIFEST").MF;
var routes_mf = acre.require("/freebase/site/routing/MANIFEST", mf.version["/freebase/site/routing"]).MF;
var routes = acre.require("/freebase/site/routing/app_routes", mf.version["/freebase/site/routing"]);


var _is_client = /^https?:\/\/((www|devel)\.)?(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(acre.request.app_url);
function is_client() {
  return _is_client;
};

/**
 * Get the canonical url for an acre resource specified by resource_path.
 * The resource_path MUST be absolute, e.g., "/user/userX/appY/foo" and the app containing the resource
 * MUST be defined in the routing manifest /freebase/site/routing/MANIFEST version map.
 * This is to ensure we prefix the proper routing path when we are served under
 * a known client url (@see is_client).
 * Also, the versions of the apps have to be consistent with routing so that we point
 * to the same version even if we use url_for in a standalone acre app.
 *
 * @param resource_path:String (required) - The ID of a resource. MUST be absolute, e.g., /user/userX/appY/foo.
 * @param params:Object,Array (optional) - Query string parameters can be
 *                                         a dictonary of {name: value, ...} or
 *                                         an array of [ [name, value] .., ] tuples.
 * @param extra_path:String (optional) - Additional path information appended to the url, e.g., http://.../resource[extra_path]?query_params
 */
function url_for(resource_path, params, extra_path) {

  // params can be an array of tuples
  // [ [name1,value1], [name2,value2], ...]
  if (params && (params instanceof Array)) {
    var dict = {};
    params.forEach(function([name,value]) {
      dict[name] = value;
    });
    params = dict;
  }

  var resource_info = routes_mf._resource_info(resource_path);

  // If served by client/routing, look up the client route
  // information from /freebase/site/routing/app_routes table.
  //
  // Known client urls:
  // http://devel.branch.qa.metaweb.com:8115
  // http://trunk.qa.metaweb.com
  // http://branch.qa.metaweb.com
  // http://www.sandbox-freebase.com
  // http://www.freebase.com
  if (is_client()) {
    var route = routes.get_route(resource_info.appid);
    if (route) {
      return acre.form.build_url(acre.request.app_url + acre.request.base_path + route.path + "/" + resource_info.name, params);
    }
    // this should NOT happen since we called routes_mf._resource_info
    throw("route undefined: " + resource_path);
  }

  // Else we are running a standalone acre app, i.e:
  // http://schema.site.freebase.dev.acre.z:8115
  // http://schema.site.freebase.dev.trunk.qa-freebaseapps.com
  // http://schema.site.freebase.dev.branch.qa-freebaseapps.com
  // http://schema.site.freebase.dev.sandbox-freebaseapps.com
  // http://schema.site.freebase.dev.freebaseapps.com
//  if (is_local) {
    // relative url for local files
//    return acre.form.build_url(resource_info.name, params);
//  }
  else {
    // else absolute resource_url for external urls
    return acre.form.build_url(resource_url(resource_info.id, resource_info.version), params);
  }
};


/**
 * Given an appid (/user/daepark/myapp) and version, generate the url to the app:
 *
 * resource_url("/user/daepark/myapp", "3") => http://3.myapp.daepark.user.dev.freebaseapps.com
 */
function app_url(appid, version) {
  var path = appid.split("/");
  path = path.reverse();
  return acre.host.protocol + "://" + (version ? (version + ".") : "") + path.join('.') + acre.host.dev_name + (acre.host.port !== 80 ? (":" + acre.host.port) : "");

};

/**
 * Given a path to an acre reource (/user/daepark/myapp/foo.png) and version, generate the url to the resource:
 *
 * resource_url("/user/daepark/myapp/foo.png", "3") => http://3.myapp.daepark.user.dev.freebaseapps.com/foo.png
 */
function resource_url(resource_path, version) {
  var path = resource_path.split("/");
  var filename = path.pop();
  return app_url(path.join("/"), version) + "/" + filename;
};


/**
 * Get the signin/signout urls depending on client/acre environment.
 */
function account_url(kind, return_url) {
  var client    = is_client();

  var client_base  = acre.freebase.site_host;
  var sclient_base = acre.freebase.site_host.replace(/^http/,"https");
  if (return_url) { return_url = encodeURIComponent(return_url); }

  var url;
  switch (kind) {
    case "signin" :
      if (client) {
        url = sclient_base +  "/signin/login?mw_cookie_scope=domain";
        if (return_url) { url += "&onsignin=" + return_url; }
      } else {
        url = "/acre/account/signin";
        if (return_url) { url += "?onsucceed=" + return_url; }
      }
      break;
    case "signout" :
      if (client) {
        url = sclient_base  + "/api/account/logout?mw_cookie_scope=domain";
        if (return_url) { url += "&onsucceed=" + return_url; }
      } else {
        url = "/acre/account/signout";
        if (return_url) { url += "?onsucceed=" + return_url; }
      }
      break;
    case "register" :
      url = client_base + "/signin/register";
      break;
    case "settings" :
      url = client_base + "/user/account?mw_cookie_scope=domain";
      if (return_url) { url += "&done=" + return_url; }
      break;
    default :
      url = client_base;
      break;
  }
  return url;
};


/**
 * url to freebase static resource (http://res.freebase.com/s/xxxx/resource/css/foo.css)
 */
function freebase_static_resource_url(path) {
  return mf.freebase.resource.base_url + path;
};
