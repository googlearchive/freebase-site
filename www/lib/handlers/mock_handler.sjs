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

var exports = {
  record: function(scope, handler) {
    console.log("mock_handler.record", scope.acre.request.script.id, "OFF");
  },
  playback: function(scope, handler, playback_file) {
    console.log("mock_handler.playback", scope.acre.request.script.id, playback_file, "OFF");
  }
};

var h = acre.require("core/helpers");
var mock_lib = acre.require("test/mock");
var validators = acre.require("validator/validators");

// ?mock=0 to disabled mock record/playback
var mock = validators.StringBool(acre.request.params, "mock", {if_empty: true});

if (mock) {

  exports.record = function(scope, handler, transform) {
    console.log("mock_handler.record", scope.acre.request.script.id, "ON");
    transform = transform || {};
    var test_data = [];
    var playback_data = {};

    function wrapper(handler_obj) {
      ["to_js", "to_module", "to_http_response"].forEach(function(m) {
        (function() {
          var orig_method = handler_obj[m];
          handler_obj[m] = function() {
            var result = orig_method.apply(this, arguments);
            if (typeof transform[m] === "function") {
              test_data.push([m, transform[m](result)]);
            }
            else {
              test_data.push([m, result]);
            }
            return result;
          };
        })();
      });
      return handler_obj;
    };

    var orig_handler = handler.handler;
    handler.handler = function() {
      var handler_obj = orig_handler();
      return wrapper(handler_obj);
    };

    // Override test() to reset response array
    var acre_test = scope.test;
    scope.test = function(name) {
      test_data.length = 0;
      acre_test.apply(scope, arguments);
      playback_data[name] = [].concat(test_data);
    };

    // Override acre.test.report() to serialize playback JSON
    var acre_test_report = scope.acre.test.report;
    scope.acre.test.report = function() {
      acre_test_report.apply(scope, arguments);
      console.log("test.report playback_data", playback_data);
      acre.write("<pre>"+JSON.stringify(playback_data)+"</pre>");
    };

  };

  exports.playback = function(scope, handler, transform, playback_file) {
    console.log("mock_handler.playback", scope.acre.request.script.id, playback_file, "ON");
    transform = transform || {};
    var playback_data = JSON.parse(scope.acre.require(playback_file).body);
    var test_info;

    function wrapper(handler_obj) {
      ["to_js", "to_module", "to_http_response"].forEach(function(m) {
        (function() {
          var test_data = playback_data[test_info.name];
          var orig_method = handler_obj[m];
          handler_obj[m] = function() {
            // Assert playback data exist for current test (name)
            if (!test_data) {
              throw(h.sprintf("Playback data does not exist: %s", test_info.name));
            }
            // Assert playback data exists for current index in the handler method callstack
            var current;
            try {
              current = test_data[test_info.index++];
              if (!current) {
                throw(test_info.index - 1);
              }
            }
            catch(ex) {
              throw(h.sprintf("Playback data IndexOutOfBoundsException: %s", ex));
            }

            var recorded_method = current[0];
            var recorded_result = current[1];

            // Assert current handler method callstack is the same as m
            if (recorded_method !== m) {
              throw(h.sprintf("Playback handler method: %s, expected: %s", m, recorded_method));
            }

            // test result
            var result = orig_method.apply(this, arguments);
            if (typeof transform[m] === "function") {
              scope.same(transform[m](result), recorded_result, m);
            }
            else {
              scope.same(result, recorded_result, m);
            }


            return result;
          };
        })();
      });
      return handler_obj;
    };

    var orig_handler = handler.handler;
    handler.handler = function() {
      var handler_obj = orig_handler();
      return wrapper(handler_obj);
    };

    // Override test() to reset current playback response
    var acre_test = scope.test;
    scope.test = function(name) {
      test_info = {name:name, index:0};
      acre_test.apply(scope, arguments);
    };
  };

};

var self = this;
self.record = exports.record;
self.playback = exports.playback;
