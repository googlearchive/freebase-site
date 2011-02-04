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
var validators = acre.require("lib/validator/validators.sjs");

/**
 * "readable" param names mapped to actual param names used in the url
 */
var _p = {
  global: {
    // global
    "domain":     "gd",
    "type":       "gt",
    "property":   "gp",
    "lang":       "gl",
    "as_of_time": "ga"
  },
  view: {
    // view
    "limit":      "vl"
  }
};
function _pn(type, name) {
  return _p[type][name];
};
function _pv(params, type, name) {
  return params[_pn(type, name)];
};

var global = {

  validate: function(params) {
    var filters = {};
    filters.lang = validators.MqlId(_pv(params, "global", "lang"), {if_invalid:null});
    filters.as_of_time = validators.Timestamp(_pv(params, "global", "as_of_time"), {if_invalid:null});
    ["domain", "type", "property"].every(function(name) {
      var v = _pv(params, "global", name);
      if (v) {
        filters[name] = validators.MqlId(v, {if_invalid:null});
        return false;
      }
      return true;
    });
    return filters;
  }

};


var view = {

  validate: function(params) {
    var filters = {
      limit: validators.Int(_pv(params, "view", "limit"), {if_invalid:10})
    };
    if (filters.limit < 1) {
      filters.limit = 10;
    }
    return filters;
  }

};
