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

var rules = acre.require("app_routes").rules;

/**
 * Split path to script_id and path_info pairs. This is not like an ordinary path split.
 *
 * /foo.bar/baz/fu?k=v => ['foo.bar', '/baz/fu', 'k=v']
 *
 * NOTE: The path MUST begin with "/" but the resulting script_id DOES NOT start with "/".
 * The script_id defaults to "index" if path is "/".
 *
 * @param path:String (required)
 * @return a pair of [script_id, path_info] where "/" + script_id + path_info = path.
 */
function split_path(path) {
  var query_string = null;
  if (path.indexOf("?") !== -1) {
    var [path, query_string] = path.split("?", 2);
  }
  var path_segs = path.split("/");
  path_segs.shift();
  var script_id = path_segs.shift() || "index";
  return [script_id, "/" + path_segs.join("/"), query_string];
};


/**
 * Split path into a pair of [root, ext] where root + "." + ext = path.
 *
 * /foo/bar/baz.png => [/foo/bar/baz, png]
 *
 * The ext defaults to "sjs" if there is no extension.
 *
 * @param path:String (required)
 * @return a pair of [root, ext] where root + "." + ext = path.
 */
function split_extension(path) {
  var i = path.lastIndexOf(".");
  if (i !== -1) {
    return [path.substring(0, i), path.substring(i+1)];
  }
  return [path, "sjs"];
};

/**
 * Get the canonical url for an acre resource specified by "app" label or path id
 *   and "file" name.
 * The "app" label MUST be defined in /freebase/site/routing/app_routes.
 */

function relative_url_for(app, file, params, extra_path) {
  var route = rules.route_for_app(app, file);
  if (!route) {
    throw "No route found in routing app_routes for app:"+app+" script:"+file;
  }

  var url;
  if (route.script && route.script === file) {
    url = route.prefix + extra_path;
  } else {
    url = route.prefix + (file ? "/" + file : "") + extra_path;
  }

  return acre.form.build_url(url, params);
}