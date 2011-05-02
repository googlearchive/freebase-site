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
  "type": type,
  "isFunction": isFunction,
  "isArray": isArray,
  "isPlainObject": isPlainObject,
  "isEmptyObject": isEmptyObject,

  "trim": trim,
  "extend": extend,

  "first_element": first_element,
  "map_array": map_array,
  "array_map": array_map,

  "endsWith": endsWith,
  "startsWith": startsWith,

  "intersect": intersect
};

// Used for trimming whitespace
var trimLeft = /^\s+/;
var trimRight = /\s+$/;

// [[Class]] -> type pairs
var class2type = {};
"Boolean Number String Function Array Date RegExp Object".split(" ").forEach(function(c) {
  class2type["[object " + c + "]"] = c.toLowerCase();
});


function type(obj) {
  return obj == null ? String(obj) : class2type[Object.prototype.toString.call(obj)] || "object";
};

function isFunction(obj) {
  return type(obj) === "function";
};

function isArray(obj) {
  return type(obj) === "array";
};

function isPlainObject(obj) {
  var hasOwn = Object.prototype.hasOwnProperty;
  if (!obj || type(obj) !== "object") {
    return false;
  }
  // Not own constructor property must be Object
  if ( obj.constructor &&
       !hasOwn.call(obj, "constructor") &&
       !hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
    return false;
  }
  var key;
  for (key in obj) {}
  return key === undefined || hasOwn.call(obj, key);
};

function isEmptyObject(obj) {
  for ( var name in obj ) {
    return false;
  }
  return true;
};

function trim(text) {
  return text == null ? "" : text.toString().replace(trimLeft, "").replace(trimRight, "");
};

var self =this;
/**
 * TODO: this should go in some library
 *
 * @see jQuery.extend()
 */
function extend() {
  var options, name, src, copy, copyIsArray, clone,
  target = arguments[0] || {},
  i = 1,
  length = arguments.length,
  deep = false;

  // Handle a deep copy situation
  if ( typeof target === "boolean" ) {
    deep = target;
    target = arguments[1] || {};
    // skip the boolean and the target
    i = 2;
  }

  // Handle case when target is a string or something (possible in deep copy)
  if ( typeof target !== "object" && !isFunction(target) ) {
    target = {};
  }

  // extend h itself if only one argument is passed
  if ( length === i ) {
    target = self;
    --i;
  }

  for ( ; i < length; i++ ) {
    // Only deal with non-null/undefined values
    if ( (options = arguments[ i ]) != null ) {
      // Extend the base object
      for ( name in options ) {
        src = target[ name ];
        copy = options[ name ];

        // Prevent never-ending loop
        if ( target === copy ) {
          continue;
        }

        // Recurse if we're merging plain objects or arrays
        if ( deep && copy && ( isPlainObject(copy) || (copyIsArray = isArray(copy)) ) ) {
          if ( copyIsArray ) {
            copyIsArray = false;
            clone = src && isArray(src) ? src : [];

          } else {
            clone = src && isPlainObject(src) ? src : {};
          }

          // Never move original objects, clone them
          target[ name ] = extend( deep, clone, copy );

          // Don't bring in undefined values
        } else if ( copy !== undefined ) {
          target[ name ] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
};

/**
 * if array and array.length > 0, return first element of the array otherwise return array
 */
function first_element(array) {
  if (isArray(array)) {
    return array.length ? array[0] : null;
  }
  else {
    return array;
  }
};

/**
 * Convert an array of objects to a dictionary using each object's key as the dictionary key.
 *
 * map_array([{a:"foo"}, {a:"bar"}], "a")  => {foo: {a:"foo"}, bar: {a:"bar"}}
 */
function map_array(a, key) {
  var map = {};
  for (var i=0,l=a.length; i<l; i++) {
    map[a[i][key]] = a[i];
  };
  return map;
};

/**
 * Flatten a dictionary to a list of key, value tuples.
 *
 * array_map({foo: {a:"foo"}, bar: {a:"bar"}}) => [ ["foo", {a:"foo"}], ["bar", {a:"bar"}] ]
 */
function array_map(map) {
  var a = [];
  for (k in map) {
    a.push([k, map[k]]);
  }
  return a;
};



function endsWith(str, end) {
  var d = str.length - end.length;
  return d >= 0 && str.lastIndexOf(end) === d;
};

function startsWith(str, start) {
  return str.indexOf(start) === 0;
};


/**
 * Does setA intersect with setB?
 * setA intersects with setB if setA.indexOf(setA[n]) !== -1;
 */
function intersect(a, b) {
  if (a == null || b == null) {
    return false;
  }
  if (!isArray(a)) {
    a = [a];
  }
  if (!isArray(b)) {
    b = [b];
  }
  if (a.length === 0 || b.length === 0) {
    return false;
  }

  for (var i=0,l=a.length; i<l; i++) {
    for (var j=0,k=b.length; j<k; j++) {
      if (a[i] == b[j]) {
        return true;
      }
    }
  }
  return false;
};

