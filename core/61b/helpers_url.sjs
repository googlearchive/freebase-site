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
  "url_for": url_for,
  "account_url": account_url,
  "freebase_url": freebase_url,
  "freebase_service_url": freebase_service_url,
  "wiki_url": wiki_url,
  "image_url": image_url,
  "parse_params": parse_params,
  "parse_uri": parse_uri
};

var mf = acre.require("MANIFEST").mf;
var app_routes = mf.require("routing", "app_routes");
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
    is_client.b = /\.(freebase|sandbox\-freebase)\.com$/.test(acre.request.server_name);
  }
  return is_client.b;
};
function is_production() {
  if (is_production.b == undefined) {
    is_production.b = /www\.freebase\.com$/.test(acre.request.server_name);
  }
  return is_production.b;
}

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
  // http://devel.branch.qa.metaweb.com:8115
  // http://trunk.qa.metaweb.com
  // http://branch.qa.metaweb.com
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
 * freebase url (i.e, http://www.freebase.com/path?params)
 */
function freebase_url(path, params) {
  return acre.form.build_url(acre.freebase.site_host + (path || ""), parse_params(params));
};

/**
 * freebase service url (i.e., http://api.freebase.com/path?params)
 */
function freebase_service_url(path, params) {
  return acre.form.build_url(acre.freebase.service_url + (path || ""), parse_params(params));
};

/**
 * freebase wiki url
 */
function wiki_url(path, params) {
  if (path) {
    path = "/wiki/" + path;
  }
  return acre.form.build_url("http://wiki.freebase.com" + (path || ""), parse_params(params));
};

/**
 * image_thumb takes an image guid and creates a blob url for fetching that image. It also passes
    appropriate dimension/cropping parameters.
    id: guid of image
    maxheight/maxwidth: maximum size of that dimension
    cropwidth: size of crop
    raw: do not user the thumbnailing service - return the raw image with the original dimensions
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
  for (var key in o) {
    if (o[key] === null || o[key] === undefined) {
      delete o[key];
    }
  }

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


// Adapted from parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License
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
};
