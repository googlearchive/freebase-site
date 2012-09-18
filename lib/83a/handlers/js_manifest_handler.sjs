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

var h = acre.require("helper/helpers.sjs");
var hh = acre.require("handlers/helpers.sjs");

var handler = function() {

  // metadata overrides to use in processing
  // currently, just make sure mjt is compiled
  // to raw js rather than a package.
  var lib_path = acre.get_metadata().path;
  var metadata_overrides = {
    "handlers": {
      "mjt": lib_path + "/handlers/mjt_to_js_handler.sjs"
    }
  };

  return {
    'to_js': function(script) {
      return "var res = ("+JSON.stringify(script.get_content())+");";
    },
    'to_module' : function(compiled_js, script) {
      var res = compiled_js.res;

      if (!compiled_js.compiled) {
        try {
          var mf = JSON.parse(res.body);
        } catch(e) {
          throw new Error(".mf files must be valid JSON.  " + e);
        }

        if (!(mf instanceof Array)) {
          throw new Error("Manifest file must be an array.");
        }

        // acquire all the files
        var buf = [];
        for (var i=0; i < mf.length; i++) {
          var path = mf[i];
          buf.push("\n/** " + path + " **/\n");
          var req = script.scope.acre.require(path, metadata_overrides);
          buf.push(req.body);
        }
        res.body = buf.join("");
        compiled_js.compiled = true;
      }

      return res;
    },
    'to_http_response': function(module, script) {
      return hh.to_http_response_result(module.body, {"content-type":"application/x-javascript"});
    }
  };
};
