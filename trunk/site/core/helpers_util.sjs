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
  "extend": extend,
  "first_element": first_element,
  "trim": trim,
  "map_array": map_array,
  "is_array": is_array,
  "array_map": array_map
};

/**
 * TODO: this should go in some library
 *
 * @see jQuery.extend()
 */
function extend() {
  var a = arguments[0];
  for (var i=1,len=arguments.length; i<len; i++) {
    var b = arguments[i];
    for (var prop in b) {
      a[prop] = b[prop];
    }
  }
  return a;
};

function first_element(array) {
  if (array instanceof Array) {
    return array.length ? array[0] : null;
  } else {
    return array;
  }
};

function trim(s) {
  return s.replace(/^\s+|\s+$/g, "");
};

function map_array(a, key) {
  var map = {};
  for (var i=0,l=a.length; i<l; i++) {
    map[a[i][key]] = a[i];
  };
  return map;
};

function array_map(map) {
  var a = [];
  for (k in map) {
    a.push([k, map[k]]);
  }
  return a;
};

function is_array(obj) {
  return toString.call(obj) === "[object Array]";
};
