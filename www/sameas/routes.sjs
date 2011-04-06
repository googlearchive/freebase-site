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
var h = acre.require("lib/helper/helpers.sjs");
var validators = acre.require("lib/validator/validators.sjs");
var split_path = acre.require("lib/routing/helpers.sjs").split_path;

var base_path = acre.request.base_path;
var path_info = acre.request.path_info;
var query_string = acre.request.query_string;

//console.log("base_path", base_path, "path_info", path_info, "query_string", query_string);

if (h.endsWith(base_path, "/index") || h.endsWith(base_path, "/index/")) {
  // /index in request path not allowed
  redirect(base_path.replace(/\/index.*$/, ""));
}

/**
 * path_info defaults "/" to "/index", so for consistency, convert "/" and "/index.*" to "/"
 * and treat it as the root namespace id ("/")
 */
if (/^\/index$/.test(path_info)) {
  path_info = "/";
}

var result;

// is path_info a valid mql id?
var id = validators.MqlId(path_info, {if_invalid:null});
if (id) {
  /**
   * MQL to determine if this topic is viewable by topic/view,
   * otherwise, redirect to associated views
   */
  var q = {
    id: id,
    type: "/common/topic"
  };
  try {
    result = acre.freebase.mqlread(q).result;
  }
  catch (e) {
    result = null;
  }
}

if (result) {
  // common topic
  route("/sameas.controller", id);
}
else {
  route(path_info);
}

function route(script, path) {
  console.log("topic/routes", script, path);

  if (script === "/") {
    script = "/index";
  }
  script = script.substring(1);
  script = acre.resolve(script);
  if (path) {
    script += path;
  }
  if (query_string) {
    script += ("?" + query_string);
  }
  acre.route(script);
};


function redirect(path) {
  if (query_string) {
    path += query_string;
  }
  acre.response.status = 301;
  acre.response.set_header("location", path);
  acre.exit();
};
