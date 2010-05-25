var __all__ = [
  "account_url",
  "app_url",
  "freebase_static_resource_url",
  "resource_url"
];

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
  var is_client    = /^https?:\/\/(www\.)?(freebase|sandbox\-freebase|branch\.qa\.freebase|trunk\.qa\.freebase)\.com\//.test(acre.request.base_url);

  var client_base  = acre.freebase.site_host;
  var sclient_base = acre.freebase.site_host.replace(/^http/,"https");
  if (return_url) { return_url = encodeURIComponent(return_url); }

  var url;
  switch (kind) {
    case "signin" :
      if (is_client) {
        url = sclient_base +  "/signin/login?mw_cookie_scope=domain";
        if (return_url) { url += "&onsignin=" + return_url; }
      } else {
        url = "/acre/account/signin";
        if (return_url) { url += "?onsucceed=" + return_url; }
      }
      break;
    case "signout" :
      if (is_client) {
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
  var mf = acre.require("MANIFEST").MF;
  return mf.freebase.resource.base_url + path;
};
