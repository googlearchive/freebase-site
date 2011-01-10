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

// Aggregated helper functions from various files

var exports = {};
var self = this;

//-----All core helper files to use-----
include_helpers(this, "helpers_util");
include_helpers(this, "helpers_date");
include_helpers(this, "helpers_url");
include_helpers(this, "helpers_format");
include_helpers(this, "helpers_sprintf");
include_helpers(this, "helpers_markup");
include_helpers(this, "helpers_mql");

//-----Functions for including new helpers-----
function include_helpers(scope, script) {
  if (typeof script === "string") {
    script = acre.require(script);
  }
  if (script.exports && typeof script.exports === "object") {
    for (var n in script.exports) {
      if (n in scope) {
        throw("Multiple helper method defined with the same name: " + n);
      }
      scope[n] = scope.exports[n] = script.exports[n];
    }
  }
}

function extend_helpers(scope) {
  include_helpers(scope, self);

  if (scope.acre.current_script === scope.acre.request.script) {
    output_helpers(scope);
  }
}

function output_helpers(scope) {
  var blacklist = ["AcreExitException", "URLError", "XMLHttpRequest"];

  if (!scope.exports || typeof scope.exports !== "object") return;

  acre.write("---Helper functions in this module---\n");
  for (var f in scope.exports) {
    var in_blacklist = false;
    blacklist.forEach(function (black) {
      if (f === black) {
        in_blacklist = true;
      }
    });

    if (scope.exports.hasOwnProperty(f) &&
        !in_blacklist &&
        typeof scope.exports[f] === 'function') {
      var code = scope.exports[f].toString();
      var signature = code.slice(code.indexOf("(")+1, code.indexOf(")"));
      acre.write(f+"("+signature+")\n\n");
    }
  }
}
