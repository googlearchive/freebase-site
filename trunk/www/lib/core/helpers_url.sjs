/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var exports = {
  "is_client": is_client,
  "is_production": is_production,

  "parse_params": parse_params,
  "build_url": build_url,
  "fb_url": fb_url,
  "static_url": static_url,
  "ajax_url": ajax_url,
  "legacy_fb_url": legacy_fb_url,
  "fb_api_url": fb_api_url,
  "wiki_url": wiki_url,
  "account_url": account_url,
  "image_url": image_url,

  "lib_base_url": lib_base_url,
  "freebase_resource_url": freebase_resource_url,

  "parse_uri": parse_uri,

  //---DEPRECATED---//
  "url_for": url_for
};

var extend = acre.require("core/helpers_util").extend;

/**
 * Known client urls:
 * http://devel.sandbox-freebase.com
 * http://www.sandbox-freebase.com
 * http://www.freebase.com
 */
function is_client() {
  if (is_client.b == undefined) {
    is_client.b = /\.(freebase|sandbox\-freebase)\.com$/.test(acre.request.server_name);
  }
  return is_client.b;
}

function is_production() {
  if (is_production.b == undefined) {
    is_production.b = /www\.freebase\.com$/.test(acre.request.server_name);
  }
  return is_production.b;
}

/**
 * params can be an array of tuples so that we can use url builders
 * in mjt templates.
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
}

/**
 * build url
 * Use to construct urls to any host
 * (i.e, host/path?params)
 */
function build_url(host, path, params) {
  // params can be a dictionary or an array of tuples
  // [ [key1, value1], [key2, value2], ...]
  params = parse_params(params);

  if (host && host.search('://') === -1) {
    throw "Host must contain scheme: " + host;
  }

  if (path && path[0] !== "/") {
    throw "Path must begin with a '/': " + path;
  }

  var url = (host || "") + (path || "");
  if (url.length === 0) {
    url = "/";
  }
  return acre.form.build_url(url, params);
}

/**
 * freebase url
 * Use to link to pages on freebase.com
 * (i.e, http://www.freebase.com/path?params)
 *
 * id is optional, and if not included then
 * params takes precidents
 */
function fb_url(path, id, params) {
  // Use an absolute url if we are currently being
  // served under an app style url
  var host;
  if (!is_client()) {
    host = acre.freebase.site_host;
  }

  if (typeof id === 'string') {
    path += id;
  } else if (typeof id === 'object' && !params) {
    params = id;
  }

  return build_url(host, path, params);
}

/**
 * static url
 * Use to link to static resources
 */
function static_url(path) {
  var static_base = acre.get_metadata().static_base || "";
  path = path.replace(".svn.freebase-site.googlecode.dev", "");
  return path.replace("//", static_base + "/static/");
}

/**
 * ajax url
 * Use to call ajax entry points
 */
function ajax_url(path, params) {
  path = path.replace(".svn.freebase-site.googlecode.dev", "");
  path = path.replace("//", "/ajax/");
  return fb_url(path, params);
}

/**
 * legacy freebase url
 * Use for pages that haven't been ported to acre yet
 * (i.e, http://www.freebase.com/path?params)
 */
function legacy_fb_url(path, params) {
  var host = acre.freebase.site_host.replace('devel.', 'www.');
  return build_url(host, path, params);
}

/**
 * freebase api url
 * Use for links to freebase apis
 * (i.e., http://api.freebase.com/path?params)
 */
function fb_api_url(path, params) {
  return build_url(acre.freebase.service_url, path, params);
}

/**
 * freebase wiki url
 * Use for links to the freebase wiki
 */
function wiki_url(page, params) {
  var path;
  if (page) {
    path = "/wiki/" + page;
  }
  return build_url("http://wiki.freebase.com", path, params);
}

/**
 * Get the signin/signout urls depending on environment.
 */
function account_url(kind, return_url) {
  var url;
  switch (kind) {
   case "signin":
    url = legacy_fb_url('/signin/login', {
      mw_cookie_scope: 'domain',
      onsucceed: return_url
    });
    break;
   case "signout":
    url = fb_api_url('/api/account/logout', {
      mw_cookie_scope: 'domain',
      onsucceed: return_url
    });
    break;
   case "register":
    url = legacy_fb_url('/signin/register', {
      onsucceed: return_url
    });
    break;
   case "settings":
    url = legacy_fb_url('/user/account', {
      done: return_url
    });
    break;
  default :
    throw "Must pass 'kind' to account_url";
  }

  return url.replace(/^http/, "https");
}

/**
 * image_thumb takes an image guid and creates a blob url for fetching that image. It also passes
    appropriate dimension/cropping parameters.
    id: guid of image
    maxheight/maxwidth: maximum size of that dimension
    cropwidth: size of crop
    raw: do not user the thumbnailing service - return the raw image with the original dimensions
*/
function image_url(id, params) {
  params = extend({
    id: id,
    maxheight: null,
    maxwidth: null,
    mode: "fit",
    use: null,
    pad: null,
    onfail: null,
    errorid: "/freebase/no_image_png"
  }, parse_params(params));

  for (var key in params) {
    if (params[key] === null || params[key] === undefined) {
      delete params[key];
    }
  }

  return fb_api_url("/api/trans/image_thumb", params);
}

function lib_base_url(key) {
  var md = acre.get_metadata();
  var lib = md.libs[key];
  return lib.base_url + lib.version;
}

function freebase_resource_url(path) {
  var r = acre.get_metadata().freebase.resource;
  return r.base_url + r.hash + path;
}

/**
 * parse uri
 * Used to convert a url string into ints components parts
 *
 * Adapted from parseUri 1.2.2
 * (c) Steven Levithan <stevenlevithan.com>
 * MIT License
 */
function parse_uri(str) {
  var o = {
    key: [
      "source", "protocol", "authority", "userInfo", "user",
      "password", "host", "port", "relative", "path",
      "directory", "file", "query", "anchor"
    ],
    q: {
      name: "params",
      parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
  };

  var m = o.parser.exec(str);
  var uri = {};
  var i = 14;

  while (i--) uri[o.key[i]] = m[i] || "";

  uri[o.q.name] = {};
  uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
    if ($1) uri[o.q.name][$1] = $2;
  });

  return uri;
}


//-----------------DEPRECATED----------------//

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
  var app_routes = acre.require("routing/app_routes");

  var path = app_routes.app_labels[app];
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
  // http://www.sandbox-freebase.com
  // http://www.freebase.com
  if (is_client()) {
    var route = app_routes.rules.route_for_app(app, file);
    if (!route) {
      throw("No route found in routing app_routes for app:"+app+" script:"+file);
    }

    if (route.script && route.script === file) {
      var url = acre.request.app_url + route.prefix + extra_path;
      return acre.form.build_url(url, params);
    } else {
      var url = acre.request.app_url + route.prefix + (file ? "/" + file : "") + extra_path;
      return acre.form.build_url(url, params);
    }

  } else {
    // Else we are running a standalone acre app, i.e:
    // http://schema.site.freebase.dev.acre.z:8115
    // http://schema.site.freebase.dev.trunk.qa-freebaseapps.com
    // http://schema.site.freebase.dev.branch.qa-freebaseapps.com
    // http://schema.site.freebase.dev.sandbox-freebaseapps.com
    // http://schema.site.freebase.dev.freebaseapps.com

    // else absolute resource_url for external urls
    // new require path syntax (i.e., //app.site.freebase.dev/file)
    var url = acre.host.protocol + ":" + path + "." + acre.host.name + (acre.host.port !== 80 ? (":" + acre.host.port) : "") + (file ? "/" + file : "") + extra_path;
    return acre.form.build_url(url, params);
  }
}
