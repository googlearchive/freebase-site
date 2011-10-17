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
var deferred = mf.require("promise", "deferred");
var h = mf.require("core", "helpers");

// Call one of these once at the end of your controller to render a
//  freebase page, or single def with the results
function render_page(data, exports, base_template) {
  base_template = base_template || mf.require("freebase");
  return _render(data, base_template, "page", exports, [exports]);
}

function render_def(data, template, def_name, var_args) {
  var args = Array.prototype.slice.call(arguments, 3);
  return _render(data, template, def_name, template, args);
}

function _render(data, template, def_name, exports, args) {
  var d = {
    "data": deferred.all(data),
    "args": deferred.all(args)
  };

  var finished_results;
  var results_p = deferred.all(d).then(function(results) {
    if (exports && exports.c && typeof exports.c === "object") {
      h.extend(exports.c, results.data);
    }
    finished_results = results;
  });

  acre.async.wait_on_results();

  try {
    d.data.cleanup();
    d.args.cleanup();
    results_p.cleanup();

    var response = template[def_name].apply(template, finished_results.args);
    acre.write(response);

  } catch (e if /www.(freebase|sandbox\-freebase)\.com$/.test(acre.request.server_name)) {
    var path = acre.form.build_url("//error.site.freebase.dev/index", {status:500});
    acre.route(path);
    acre.exit();
  }

  return "";
}
