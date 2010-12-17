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

var mf = acre.require("MANIFEST").mf;
var h = mf.require("routing", "helpers");

var query_string = acre.request.query_string;

/**
 * MQL to determine if acre.request.path_info is a domain, type or property.
 */
var q = {
  id: acre.request.path_info,
  "d:type": {id:"/type/domain", optional:true},
  "t:type": {id:"/type/type", optional:true},
  "p:type": {id:"/type/property", optional:true}
};

var result;
try {
  result = acre.freebase.mqlread(q).result;
}
catch (e) {
  result = null;
}
if (result) {
  if (result["d:type"]) {
    do_route_domain(result.id);
  }
  else if (result["t:type"]) {
    do_route_type(result.id);
  }
  else if (result["p:type"]) {
    do_route_property(result.id);
  }
  else {
    do_route_local();
  }
}
else {
  do_route_local();
}

function do_route(script, path_info) {
  var path = [acre.request.script.app.path, "/" + script, path_info, query_string ? "?" + query_string : ""];
  path = path.join("");
  console.log("routing", path);
  acre.route(path);
}

function do_route_domain(id) {
  do_route("domain", id);
};

function do_route_type(id) {
  do_route("type", id);
};

function do_route_property(id) {
  do_route("property", id);
};

function do_route_local() {
  var [script, path_info, qs] = h.split_path(acre.request.path_info);
  do_route(script, path_info);
};
