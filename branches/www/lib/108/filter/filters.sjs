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
var validators = acre.require("validator/validators.sjs");

/**
 * Global params spec
 */
var PARAMS = {
  // global
  "domain": {
    validator: validators.MqlId,
    options: {if_invalid:null}
  },
  "type": {
    validator: validators.MqlId,
    options: {if_invalid:null}
  },
  "property": {
    validator: validators.MqlId,
    options: {if_invalid:null}
  },
  "domains": {
    validator: validators.OneOf,
    options: {
      oneof: ["all"],
      if_invalid: null
    }
  },
  "embed": {
    validator: validators.StringBool,
    options: {if_invalid:null, if_empty:null}
  }
};


/**
 * Transform and validate a flat params dictionary to a filter dictionary with validated values.
 *
 * All validation will be subject to the Global params spec (@see PARAMS).
 *
 * Optionally, you can specify a params_spec that will be merged into the global params spec.
 *
 * var params = {
 *   domain:"/film"
 * };
 * console.log(validate(params));  ==> {domain:"/film"}
 *
 *
 * params = {
 *  domain:"/film",
 *  myparam:"bar"
 * };
 * validate(params, {
 *   myparam: {
 *     validator:validators.String
 *   }
 * }); ==> {domain:"/film", myparam:"bar"}
 *
 */
function validate(params, params_spec) {
  var spec = PARAMS;
  if (params_spec) {
    spec = h.extend({}, PARAMS, params_spec);
  }
  check_param_spec(spec);

  var filters = {};
  for (var k in spec) {
    var pspec = spec[k];
    filters[k] = pspec.validator.apply(null, [params, k, pspec.options]);
  }
  return filters;
};

function assert(truth, msg) {
  if (!truth) {
    throw msg;
  }
};

function check_param_spec(spec) {
  var seen = {};
  for (var k in spec) {
    var pspec = spec[k];
    assert(pspec && pspec.validator, "param spec needs to specify a validator");
  }
};
