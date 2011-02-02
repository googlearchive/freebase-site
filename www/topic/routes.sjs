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

var path_info = acre.request.path_info;
var query_string = acre.request.query_string;

console.log("path_info", path_info, "query_string", query_string);

/**
 * path_info defaults "/" to "/index", so for consistency, convert "/" and "/index.*" to "/"
 * and treat it as the root namespace id ("/")
 */
if (/^\/index(?:\.\w+)*$/.test(path_info)) {
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
    "d:type": {id:"/type/domain", optional:true},
    "t:type": {id:"/type/type", optional:true},
    "p:type": {id:"/type/property", optional:true},
    "u:type": {id:"/type/user", optional:true},
    "type":   {id:"/common/topic", optional:true}
  };
  try {
    result = acre.freebase.mqlread(q).result;
  }
  catch (e) {
    result = null;
  }
}

console.log("result", result);

if (result) {
  if (result["d:type"] || result["t:type"] || result["p:type"]) {
    // schema
    redirect(h.fb_url("/schema", id));
  }
  else if (result["u:type"]) {
    // user
    redirect(h.legacy_fb_url("/view", id));
  }
  else if (result.type) {
    // common topic
    route("view/index.controller", id);
  }
  else {
    // inspect
    redirect(h.fb_url("/inspect", id));
  }
}
else {
  var [script, path, qs] = split_path(path_info);
  route(script, path);
}

function redirect(url) {
  acre.response.status = 301;
  url += (query_string ? "?" + query_string : "");
  acre.response.set_header("location", url);
  acre.exit();
};

function route(script, path) {
  script = acre.resolve(script);
  if (path) {
    script += path;
  }
  if (query_string) {
    script += ("?" + query_string);
  }
  acre.route(script);
};
