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
var lib = acre.require("handlers/service_lib.sjs");
var deferred = acre.require("promise/deferred.sjs");

var handler = function() {
  return h.extend({}, acre.handlers.acre_script, {
    to_http_response: function(module, script) {
      module.body = run_spec(module.SPEC, script.scope);
      var headers = {
        "content-type": "text/html"
      };
      h.set_cache_policy(module.SPEC.cache_policy || "public", null, headers);
      return hh.to_http_response_result(module.body, headers);
    }
  });
};

function run_spec(spec, scope) {
  /*
   * Keep user logged in
   *
   * If not already in the process of signing in or out,
   * make sure we're in the correct state:
   *  - request protocol matches signed-in state
   *  - don't have an orphaned fb-account-cookie
   *  - access_token hasn't expired
   *
   * This seems to be the best place to do this check because:
   *  - runs on every top-level page render
   *  - but not on any ajax or resource calls
   *  - before executing promises (faster)
   */
  if (scope.acre.request.base_path.indexOf("/account/") !== 0) {
    if (h.get_account_cookie()) {
      acre.oauth.get_authorization(h.account_provider());
    } else {
      h.ensure_protocol("http");
    }
  }

  var result;
  var acre_exit = false;
  var d = lib.handle_service(spec, scope)
    .then(null, function(service_error) {
      if (service_error.code === "/api/status/error/auth" &&
          spec.auth_redirect) {
        // If the user is not logged-in then redirect to the specified page
        h.clear_account_cookie();
        acre.response.status = 302;
        acre.response.set_header("Location", spec.auth_redirect);
        acre_exit = true;
        acre.exit();
      }
      else if (service_error.status === 302 && service_error.location) {
        acre.response.status = 302;
        acre.response.set_header("Location", service_error.location);
        acre_exit = true;
        acre.exit();
      }
      return service_error;
    })
    .then(function(service_result) {
      return render(service_result.result, spec, scope);
    })
    .then(null, function(service_error) {
      // propagate acre.route() and acre.exit()
      if (service_error instanceof acre.errors.AcreRouteException ||
          service_error instanceof acre.errors.AcreExitException) {
        acre_exit = true;
        return service_error;
      }
      // otherwise, render the error
      spec.template = acre.require("error/error.mjt");
      return render({einfo: service_error}, spec, scope);
    })
    .then(function(render_result) {
      result = acre.markup.stringify(render_result);
    });

  acre.async.wait_on_results();

  if (!acre_exit) {
    // We can't cleanup the Exception thrown by acre.exit()
    d.cleanup();
  }

  return result;
}

function render(service_result, spec, scope) {
  // make a shallow copy of the result
  var result = h.extend({}, service_result);

  // render options
  var o = {};

  // get render options (keywords) and remove from result dictionary
  ["template", "template_base", "template_base_args", "def", "def_args"].forEach(function(reserved_key) {
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
  o.template_base_args = o.template_base_args || spec.template_base_args;

  // template needs to be defined
  if (!o.template) {
    throw "template needs to be defined";
  }

  return deferred.all(o.c || {})  // resolve all promises in c
    .then(function(c) {
      o.c = c;

      var all_args = [];
      all_args.push(deferred.all(o.template_base_args || {})); // resolve all promises in template_base_args
      all_args.push(deferred.all(o.def_args || [])); // resolve all promises in def_args

      return deferred.all(all_args);
    })
    .then(function([template_base_args, def_args]) {
      o.template_base_args = template_base_args;
      o.def_args = def_args;
    })
    .then(function() {
      var template;
      var exports;
      if (o.def) {
        try {
          template = is_module(o.template) ? o.template : scope.acre.require(o.template);
        } catch (error) {
          throw new Error("Could not load template. Does '"+o.template+"' exist? "+error);
        }
        exports = template;
      }
      else {
        if (o.template_base) {
          try {
            template = is_module(o.template_base) ? o.template_base : scope.acre.require(o.template_base);
          } catch (error) {
            throw new Error("Could not load base template. Does '"+o.template_base+"' exist? " + error);
          }
        }
        else {
          // default to template/freebase.mjt, but allow over-riding with 'template_base' in METADATA
          var template_base = scope.acre.get_metadata().template_base;
          template = template_base ? scope.acre.require(template_base) : acre.require("template/freebase.mjt");
        }
        if (template.c && typeof template.c === "object") {
          h.extend(template.c, o.template_base_args, o.c);
        }
        try {
          exports = is_module(o.template) ? o.template : scope.acre.require(o.template);
        } catch (error) {
          throw new Error("Could not load template. Does '"+o.template+"' exist? " + error);
        }
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

