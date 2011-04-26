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
var i18n = acre.require("i18n/i18n.sjs");

/**
 * IMPORTANT!!!
 * If you are modifying helpers (especially url helpers), please update the corresponding client-side helpers
 * so that their functionality and usages (method signatures) are the same.
 */

var exports = {
  "is_client": is_client,
  "is_production": is_production,

  "parse_params": parse_params,
  "build_url": build_url,
  "fb_url": fb_url,
  "ajax_url": ajax_url,
  "static_url": static_url,
  "legacy_fb_url": legacy_fb_url,
  "fb_api_url": fb_api_url,
  "wiki_url": wiki_url,

  "account_url": account_url,
  "image_url": image_url,

  "lib_base_url": lib_base_url,

  "parse_uri": parse_uri
};

var h = acre.require("helper/helpers_util.sjs");

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
  if (h.isArray(params)) {
    var dict = {};
    params.forEach(function([name,value]) {
      dict[name] = value;
    });
    return dict;
  }
  return params;
}


/**
 * All url helpers take variable number of arguments (varargs),
 * where you can pass it a list of paths followed by
 * a querystring dicionary or tuple array (@see parse_params).
 *
 * xxx_url(path1, path2, path3, ..., params) => path1 + path2 + path3 + ? + $.params(params)
 */


/**
 * build url
 * Use to construct urls to any host
 * (i.e, host/path?params)
 */
function build_url(host /**, path1, path2, ..., params **/) {
  if (host && host.indexOf('://') === -1) {
    throw "Host must contain scheme: " + host;
  }
  var url = (host || "");
  var path;
  var params;
  if (arguments.length > 1) {
    var args = Array.prototype.slice.call(arguments);
    args.shift();
    var paths = [];

    for(var i=0,l=args.length; i<l; i++) {
      var arg = args[i];
      var t = h.type(arg);
      if (t === "string") {
        paths.push(arg);
      }
      else {
        // last argument(s) are the params dictionary or array
        params = {};
        for (var j=i; j<l; j++) {
          params = h.extend(params, parse_params(args[j]));
        }
        break;
      }
    };
    path = paths.join("");
  }
  if (path && path.indexOf("/") !== 0) {
    throw "Path must begin with a '/': " + path;
  }
  if (path) {
    url += path;
  }
  if (url === "") {
    url = "/";
  }
  return acre.form.build_url(url, params);
};


/**
 * freebase url
 * Use to link to pages on freebase.com
 * (i.e, http://www.freebase.com/path?params)
 *
 * id is optional, and if not included then
 * params takes precidents
 */
function fb_url() {
  var args = Array.prototype.slice.call(arguments);
  var absolute = false;
  if (args.length && typeof args[0] === "boolean") {
    absolute = args.shift();
  }
  if (absolute) {
    args.unshift(acre.freebase.site_host);
  }
  else {
    args.unshift(null); // host is null to specify relative url
  }
  if (i18n.lang !== "/lang/en") {
    args.push({lang:i18n.lang});
  }
  return build_url.apply(null, args);
};

/**
 * Create an ajax reenrant url: /ajax/...
 *
 * ajax_url can take a full app path syntax (e.g., //1a.schema.www.trunk.svn.freebase-site.googlecode.dev)
 * or a regular path.
 *
 * If a regular path and starts with "lib/" (without a beginning "/"),
 * the ajax url will be mapped to the lib app which is acre.current_script.app.path:
 *
 * ajax_url("lib/path") => /ajax/lib.www.trunk/path
 *
 * All other paths will default to the current request script app path which is acre.request.script.app.path:
 *
 * ajax_url("path") => /ajax/app.www.trunk/path
 * ajax_url("/path") => /ajax/app.www.trunk/path
 */
function ajax_url(path, params) {
  var args = Array.prototype.slice.call(arguments);
  args.unshift("/ajax");
  return reentrant_url.apply(null, args);
};

/**
 * Create a static reentrant url: /static/...
 *
 * @see ajax_url
 */
function static_url(path) {
  var args = Array.prototype.slice.call(arguments);
  var static_base = acre.get_metadata().static_base || "";
  args.unshift(static_base + "/static");
  return reentrant_url.apply(null, args);
};

function reentrant_url(prefix, path) {
  path = resolve_reentrant_path(path);
  path = path.replace(/^\/\//, prefix + "/");
  path = path.replace(".svn.freebase-site.googlecode.dev", "");
  var args = Array.prototype.slice.call(arguments, 2);
  args.unshift(path);
  args.unshift(null); // relative url
  return build_url.apply(null, args);
};

function resolve_reentrant_path(path) {
  path = path || "";
  if (path.indexOf("//") == 0) {
    return path;
  }
  if (path.indexOf("lib/") === 0) {
    return acre.current_script.app.path + path.substring(3);
  }
  else {
    if (path && path[0] != "/") {
      path = "/" + path;
    }
    return acre.request.script.app.path + path;
  }
};

/**
 * legacy freebase url
 * Use for pages that haven't been ported to acre yet
 * (i.e, http://www.freebase.com/path?params)
 */
function legacy_fb_url() {
  var args = Array.prototype.slice.call(arguments);
  var host = acre.freebase.site_host
    .replace('devel.', 'www.')
    .replace(':'+acre.request.server_port, '');
  args.unshift(host);
  return build_url.apply(null, args);
}

/**
 * freebase api url
 * Use for links to freebase apis
 * (i.e., http://api.freebase.com/path?params)
 */
function fb_api_url() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift(acre.freebase.service_url);
  return build_url.apply(null, args);
};

/**
 * freebase wiki url
 * Use for links to the freebase wiki
 * (i.e., http://wiki.freebase.com/wiki//<page>)
 *
 * Note that this is a little bit different from other forms of url helpers
 * in that the path, "/wiki/" is automatically prepended to the page parameter
 * so that you only need to pass the name of the wiki page
 *
 * wiki_url("Enumerated_type") => http://wiki.freebase.com/wiki/Enumerated_type
 */
function wiki_url(page) {
  var args = Array.prototype.slice.call(arguments);
  args.unshift("http://wiki.freebase.com", "/wiki/");
  return build_url.apply(null, args);
};

/**
 * Get the signin/signout urls depending on environment.
 */
function account_url(kind, return_url) {
  var url;
  switch (kind) {
   case "signin":
    url = legacy_fb_url('/signin/login', {
      mw_cookie_scope: 'domain',
      onsignin: return_url
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
  params = h.extend({
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

   return acre.freebase.imgurl(id, params.maxwidth, params.maxheight, params.mode, params.errorid);
  //return fb_api_url("/api/trans/image_thumb", params);
}

function lib_base_url(key) {
  var md = acre.get_metadata();
  var lib = md.libs[key];
  return lib.base_url + lib.version;
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
