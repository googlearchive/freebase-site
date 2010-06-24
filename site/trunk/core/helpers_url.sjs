/**
 * helpers_url and helpers_url2 are split into 2 separate libraries since
 * the core MANIFEST depends on helpers_url and helpers_url2 depends on the core MANIFEST.
 * If you need all helpers in helpers_url AND helpers_url2, simply acre.require("helpers_url2"),
 * which will automatically include all helpers in helpers_url.
 */

var exports = {
  "is_client": is_client,
  "app_url": app_url,
  "resource_url": resource_url,
  "account_url": account_url,
  "freebase_url": freebase_url,
  "parse_params": parse_params
};

/**
 * Known client urls:
 * http://devel.branch.qa.metaweb.com:8115
 * http://trunk.qa.metaweb.com
 * http://branch.qa.metaweb.com
 * http://www.sandbox-freebase.com
 * http://www.freebase.com
 */
function is_client() {
  if (is_client.b == undefined) {
    is_client.b = /^https?:\/\/((www|devel)\.)?(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(acre.request.app_url);
  }
  return is_client.b;
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
 * freebase url
 */
function freebase_url(path, params) {
  return acre.form.build_url(acre.freebase.service_url + (path || ""), parse_params(params));
};


/**
 * params can be an array of tuples
 *
 * @param params:Object,Array (optional) - Query string parameters can be
 *                                         a dictonary of {name: value, ...} or
 *                                         an array of [ [name, value] .., ] tuples.
 */
function parse_params(params) {
  // [ [name1,value1], [name2,value2], ...]
  if (params && (params instanceof Array)) {
    var dict = {};
    params.forEach(function([name,value]) {
      dict[name] = value;
    });
    params = dict;
  }
  return params;
};
