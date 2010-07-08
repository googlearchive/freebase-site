var exports = {
  "is_client": is_client,
  "url_for": url_for,
  "account_url": account_url,
  "freebase_url": freebase_url,
  "freebase_static_resource_url": freebase_static_resource_url,
  "get_image_dimensions": get_image_dimensions,
  "get_image_orientation": get_image_orientation,
  "image_thumb_url": image_thumb_url,
  "image_url": image_url,
  "parse_params": parse_params
};

var mf = acre.require("MANIFEST").MF;
var routes_mf = mf.require("routing", "MANIFEST").MF;
var routes = mf.require("routing", "app_routes");
var extend = mf.require("helpers_util").extend;

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
 * Get the canonical url for an acre resource specified by "app" label and "file" name.
 * The "app" label MUST be defined in the /freebase/site/routing/MANIFEST and /freebase/site/routing/app_routes.
 * This is to ensure we prefix the proper routing path when we are served under
 * a known client url (@see is_client).
 *
 * @param app:String (required) - The app label defined in /freebase/site/routing/MANIFEST and /freebase/site/routing/app_routes.
 * @param file:String (require) - The file name where /app/label/id/file = the graph id.
 * @param params:Object,Array (optional) - Query string parameters can be
 *                                         a dictonary of {name: value, ...} or
 *                                         an array of [ [name, value] .., ] tuples.
 * @param extra_path:String (optional) - Additional path information appended to the url, e.g., http://.../resource[extra_path]?query_params
 */
function url_for(app, file, params, extra_path) {
  var path = routes_mf.apps[app];
  if (!path) {
    throw("app is not defined in the routing MANIFEST: " + app);
  }
  // params can be an array of tuples
  // [ [name1,value1], [name2,value2], ...]
  params = parse_params(params);
  if (!extra_path) {
    extra_path = "";
  }
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
    var rts = routes.get_routes(app);
    if (!rts) {
      throw("route undefined in routing app_routes: " + app);
    }
    for (var i=0,l=rts.length; i<l; i++) {
      var r = rts[i];
      if (r.script) {
        if (r.script === file) {
          var url = acre.request.app_url /*+ acre.request.base_path*/ + r.from + extra_path;
          return acre.form.build_url(url, params);
        }
      }
      else {
        var url = acre.request.app_url /*+ acre.request.base_path*/ + r.from + (file ? "/" + file : "") + extra_path;
        return acre.form.build_url(url, params);
      }
    }
  }

  // Else we are running a standalone acre app, i.e:
  // http://schema.site.freebase.dev.acre.z:8115
  // http://schema.site.freebase.dev.trunk.qa-freebaseapps.com
  // http://schema.site.freebase.dev.branch.qa-freebaseapps.com
  // http://schema.site.freebase.dev.sandbox-freebaseapps.com
  // http://schema.site.freebase.dev.freebaseapps.com
  else {
    // else absolute resource_url for external urls
    // new require path syntax (i.e., //app.site.freebase.dev/file)
    var url = acre.host.protocol + ":" + path + "." + acre.host.name + (acre.host.port !== 80 ? (":" + acre.host.port) : "") + (file ? "/" + file : "") + extra_path;
    return acre.form.build_url(url, params);
  }
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
 * url to freebase static resource (http://res.freebase.com/s/xxxx/resource/css/foo.css)
 */
function freebase_static_resource_url(path) {
  return mf.freebase.resource.base_url + (path || "");
};


function get_image_dimensions(image) {
  var size = image["/common/image/size"] || image.size;
  if (size) {
    return [size.x, size.y];
  }
  return [null, null];
};

function get_image_orientation(image) {
  var [width, height] = get_image_dimensions(image);
  if (width && height) {
    return (width - height < 0) ? 'portrait' : 'landscape';
  }
  return null;
};


function image_thumb_url(image, size, options) {
  size = size || 16;
  var o = extend({mode:"fit"}, options);
  if (o.mode === "fill") {
    var orientation = get_image_orientation(image);
    if (orientation === "portrait") {
      return image_url(image.id, extend(o, {maxwidth:size}));
    }
    else {
      return image_url(image.id, extend(o, {maxheight:size}));
    }
  }
  else { // fit, fillcrop, fillcropmid
    return image_url(image.id, extend(o, {maxheight:size,maxwidth:size}));
  }
};

/**
 * image_thumb takes an image guid and creates a blob url for fetching that image. It also passes
    appropriate dimension/cropping parameters.
    id: guid of image
    maxheight/maxwidth: maximum size of that dimension
    cropwidth: size of crop
    raw: do not user the thumbnailing service - return the raw image with the original dimensions
    NOTE: some of these parameters should really be booleans. However, this gets called from genshi
    which passes stream objects. bool(<stream>) returns True even if the stream is empty while
    str(<stream>) returns False when checked if the original string is empty.
    use: the use of this image for reporting and tracking purposes (performance)
*/
function image_url(id, options) {
  var o = extend({
    id: id,
    maxheight: null,
    maxwidth: null,
    mode: "fit",
    use: null,
    pad: null,
    onfail: null,
    errorid: "/freebase/no_image_png"
  }, options);
  return acre.form.build_url(freebase_url("/api/trans/image_thumb"), o);
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
