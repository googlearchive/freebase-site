/**
 * helpers_url and helpers_url2 are split into 2 separate libraries since
 * the core MANIFEST depends on helpers_url and helpers_url2 depends on the core MANIFEST.
 * If you need all helpers in helpers_url AND helpers_url2, simply acre.require("helpers_url2"),
 * which will automatically include all helpers in helpers_url.
 */

var __all__ = [
  "url_for",
  "freebase_url",
  "freebase_static_resource_url"
];
var self = this;
var h_url = acre.require("helpers_url");
h_url.__all__.forEach(function(m) {
  self[m] = h_url[m];
  __all__.push(m);
});

var MANIFEST = acre.require("MANIFEST");
var mf = MANIFEST.MF;
var routes_mf = acre.require("/freebase/site/routing/MANIFEST", mf.version["/freebase/site/routing"]).MF;
var routes = acre.require("/freebase/site/routing/app_routes", mf.version["/freebase/site/routing"]);

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
  params = parse_params(params);

  if (!extra_path) {
    extra_path = "";
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
    var rts = routes.get_routes(resource_info.appid);
    if (rts) {
      for (var i=0,l=rts.length; i<l; i++) {
        var route = rts[i];
        if (route.as === "script") {
          if (route.to === resource_info.id) {
            return acre.form.build_url(acre.request.app_url + acre.request.base_path + route.from + extra_path, params);
          }
        }
        else {
          return acre.form.build_url(acre.request.app_url + acre.request.base_path + route.from + "/" + resource_info.name + extra_path, params);
        }
      }
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
    return acre.form.build_url(resource_url(resource_info.id, resource_info.version) + extra_path, params);
  }
};

/**
 * freebase url
 */
function freebase_url(path, params) {
  return acre.form.build_url(acre.freebase.service_url + (path || ""), parse_params(params));
};


/**
 * url to freebase static resource (http://res.freebase.com/s/xxxx/resource/css/foo.css)
 */
function freebase_static_resource_url(path) {
  return mf.freebase.resource.base_url + (path || "");
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
