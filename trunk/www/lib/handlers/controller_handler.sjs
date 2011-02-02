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

var h = acre.require("helper/helpers.sjs");
var hh = acre.require("handlers/helpers.sjs");
var lib = acre.require("handlers/service_lib.sjs");
var deferred = acre.require("promise/deferred.sjs");

var handler = function() {
  return h.extend({}, acre.handlers.acre_script, {
    to_http_response: function(module, script) {
      var d = lib.handle_service(module, script)
        .then(function(service_result) {
          return render(service_result.result, module.SPEC, script.scope);
        })
        .then(function(render_result) {
          module.body = acre.markup.stringify(render_result);
        });

      acre.async.wait_on_results();

      d.cleanup();

      return module;
    }
  });
};

function render(service_result, spec, scope) {
  // make a shallow copy of the result
  var result = h.extend({}, service_result);

  // render options
  var o = {};

  // get render options (keywords) and remove from result dictionary
  ["template", "template_base", "def", "def_args"].forEach(function(reserved_key) {
    if (reserved_key in result) {
      o[reserved_key] = result[reserved_key];
      delete result[reserved_key];
    }
  });
  o.c = result;

  // is there a service SPEC?
  spec = spec || {};
  o.template = o.template || spec.template;
  o.template_base = o.template_base || spec.template_base;

  // template needs to be defined
  if (!o.template) {
    throw "template needs to be defined";
  }

  return deferred.all(o.c || {}, true)  // resolve all promises in c
    .then(function(c) {
      o.c = c;
      return deferred.all(o.def_args || [], true); // resolve all promises in def_args
    })
    .then(function(def_args) {
      o.def_args = def_args;
    })
    .then(function() {
      var template;
      var exports;
      if (o.def) {
        template = is_module(o.template) ? o.template : scope.acre.require(o.template);
        exports = template;
      }
      else {
        if (o.template_base) {
          template = is_module(o.template_base) ? o.template_base : scope.acre.require(o.template_base);
        }
        else {
          // default to template/freebase.mjt
          template = acre.require("template/freebase.mjt");
        }
        exports = is_module(o.template) ? o.template : scope.acre.require(o.template);
        o.def = "page";
        o.def_args = [exports];
      }
      if (exports.c && typeof exports.c === "object") {
        h.extend(exports.c, o.c);
      }
      return template[o.def].apply(template, o.def_args);
    });
};

/**
 * Is this already a module (as a result of acre.require) or
 * a string path that we need to perform an acre.require?
 */
function is_module(module) {
  return typeof module !== "string";
};

