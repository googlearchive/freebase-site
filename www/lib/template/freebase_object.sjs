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
var fh = acre.require("filter/helpers.sjs");
var service_lib = acre.require("handlers/service_lib.sjs");
var controller = acre.require("handlers/controller_handler.sjs");

function main(tabs, object) {

  var i,l;

  // TODO: assert tabs.length, tabs[i].app, tabs[i].script

  // find current tab
  var current_tab = tabs[0];
  for (i=0,l=tabs.length; i<l; i++) {
    var t = tabs[i];
    if (t.key in acre.request.params) {
      current_tab = t;
      break;
    }
  }

  var template_base_args = {
    object: object,
    tabs: tabs,
    current_tab: current_tab,
    filters: fh.global_filters(acre.request_params)
  };

  h.extend(acre.request.params, template_base_args);

  var script = acre.require(current_tab.app + "/" + current_tab.script);

console.log(script);

  var spec = script.SPEC;
  spec.template_base = "lib/template/freebase_object.mjt";
  spec.template_base_args = template_base_args;

  // TODO (culbertson): try/catch and render error tab content on failure
  return controller.run_spec(spec, script);
};
