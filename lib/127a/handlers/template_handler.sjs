/*
* Copyright 2012, Google Inc.
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


/*
* Monkey-patch the Mjt compiler
* so we can turn relative paths
* into static URLs for certain tag combos
*/

var h = acre.require("helper/helpers.sjs");
var hh = acre.require("handlers/helpers.sjs");

var mjt_patch = acre.require("handlers/mjt_patch.js").mjt_patch;

var controller = acre.require("handlers/controller_handler.sjs");

function handler() {
  var handler = {};

  handler.to_js = function(script) {
    mjt_patch.call(this, script);
    var cpkg = mjt.acre.compile_string(script.get_content().body, script.class_name);
    script.linemap = cpkg.debug_locs;
    return 'var pkgdef = (' + cpkg.toJS() +');';
  };

  // this part is no different than standard Mjt
  handler.to_module = acre.handlers.mjt.to_module;

  handler.to_http_response = function(module, script) {
    var spec = {
      template: module,
      run: function() {
        return module.c;
      }
    };
    module.body = controller.run_spec(spec, script.scope);
    var headers = {
      "content-type": "text/html"
    };
    h.set_cache_policy(spec.cache_policy || "public", null, headers);
    return hh.to_http_response_result(module.body, headers);
  };

  return handler;
};
