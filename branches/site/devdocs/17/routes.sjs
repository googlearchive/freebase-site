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

//XXX: why test this? if (acre.current_script === acre.request.script) {

var path_info = acre.request.path_info;

var parts = path_info.split('/');
var filename = parts[1];

var md = acre.get_metadata();
if (filename !== "iframe" && filename in md.files) {
  var relative_url = path_info.replace(/^\//,''); //XXX: support query str?
  acre.route(relative_url); 
}

var mf = acre.require("MANIFEST").mf;

//XXX: TODO: should load page contents as promises, rather than in templates
var data = {
  base_path: '/'+acre.request.base_path.split('/')[1], // '/docs/xxx' --> '/docs'
  path_info:path_info
};

var renderer = mf.require("template", "renderer");

if (path_info==="/") {
  renderer.render_page(data,mf.require("index"));
} else if (filename === "iframe") {
    data.base_path = data.base_path + "/iframe";
	data.path_info = path_info.replace("/iframe","");
	renderer.render_page(data, mf.require("doc"), mf.require("iframe"));
} else {
  renderer.render_page(data,mf.require("doc"));
}


