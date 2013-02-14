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

var topscope = this.__proto__;

var h = acre.require("helper/helpers.sjs");
var fh = acre.require("filter/helpers.sjs");
var service_lib = acre.require("handlers/service_lib.sjs");
var controller = acre.require("handlers/controller_handler.sjs");

function main(rule, object) {
  rule.tabs = rule.tabs || [];
  var object_type = {
    id: rule.type,
    name: rule.name
  };

  // look in tabs and more_tabs to find a routing match
  var tabs = [];
  var more_tabs = [];
  var current_tab = null;

  var referer_params = {};
  if (acre.request.headers.referer && 
      acre.request.headers.referer.indexOf(acre.request.app_url) === 0) {
      /**
       * Are we coming from within our own domain/site?
       * If so, we want to stay within the same tab/context.
       * 
       * For example, if a user is looking at the "Links" tab
       * of a topic and uses the main search suggest to navigate to an object,
       * we want to go to the "Links" tab of that object.
       * 
       * To accomplish this we want to look at the referer and it's query
       * string parameters.
       */
      var referer_query_string = acre.request.headers.referer.indexOf("?");
      if (referer_query_string !== -1) {
          referer_query_string = acre.request.headers.referer.substring(referer_query_string + 1);
          referer_params = acre.form.decode(referer_query_string);
      }
  }

  rule.tabs.forEach(function(t) {
    if (t.key in acre.request.params || t.path === acre.request.path_info) {
      current_tab = t;
    }
    var hidden = false;
    if (typeof t.hidden === 'boolean') {
      hidden = t.hidden;
    }
    else if (typeof t.hidden === 'function') {
      hidden = t.hidden(object);
    }
    t.hidden = hidden;
    if (!t.hidden) {
      if (t.more) {
        more_tabs.push(t);
      } else {
        tabs.push(t);
      }
    }
  });

  /**
   * Try to find the best tab looking at the referer if a tab is not specified.
   */
  if (!current_tab) {
    rule.tabs.every(function(t) {
        if (t.key in referer_params) {
          current_tab = t;
          return false;
        }
        return true;
    });
  }

  if (!current_tab && tabs.length) {
    current_tab = tabs[0];
  }

  var template_base_args = {
    object: object,
    object_type: object_type,
    tabs: tabs,
    more_tabs: more_tabs,
    nav_keys: rule.nav_keys || [],
    gear: rule.gear || [],
    banners: rule.banners || [],
    show_image: rule.show_image,
    filters: fh.global_filters(acre.request.params)
  };

  // extend object type (global) promises
  rule.promises && rule.promises.forEach(function(p) {
    var d = acre.require(p.app + "/" + p.script)[p.promise](object, object_type);
    template_base_args[p.key] = d;
  });

  var script, params;
  if (current_tab) {
    template_base_args.current_tab = current_tab;
    script = acre.require(current_tab.app + "/" + current_tab.script);
    params = current_tab.params;
    current_tab.promises && current_tab.promises.forEach(function(p) {
      var d = acre.require(p.app + "/" + p.script)[p.promise](object, object_type);
      template_base_args[p.key] = d;
    });
  }

  // Manually overlay tab context onto acre.request since we're not using acre.route
  h.extend(topscope.acre.request.params, template_base_args, params);
  topscope.acre.request.script = script.acre.current_script;

  var spec = script.SPEC;
  if (current_tab && !current_tab.hidden) {
    spec.template_base = spec.template_base || "lib/template/object.mjt";
  }
  spec.template_base_args = template_base_args;

  return controller.run_spec(spec, script);
};
