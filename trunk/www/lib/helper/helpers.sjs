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

var exports = {

  // UTIL

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
  "intersect": intersect,
  "splice_with_key": splice_with_key,

  // MQL

  "is_literal_type": is_literal_type,
  "to_literal_value": to_literal_value,
  "is_metaweb_system_type": is_metaweb_system_type,
  "get_type_role": get_type_role,
  "is_reciprocal": is_reciprocal,
  "visible_subprops": visible_subprops,
  "is_commons_id": is_commons_id,
  "id_key": id_key,
  "lang_code": lang_code,
  "get_creator": get_creator,
  "fb_object_type": fb_object_type,

  // MATH
  "round": round,
  "format_stat": format_stat,

  // SPRINTF
  "sprintf": sprintf,
  "template_sprintf": template_sprintf,
  "vsprintf": vsprintf,

  // CACHE
  "set_cache_policy": set_cache_policy,

  // ACCOUNT

  "set_account_cookie": set_account_cookie,
  "clear_account_cookie": clear_account_cookie,
  "get_account_cookie": get_account_cookie,
  "account_cookie_name": account_cookie_name,
  "account_cookie_options": account_cookie_options,
  "has_account_credentials": has_account_credentials,
  "account_provider": account_provider,
  "get_active_user": get_active_user,

  // DATE
  "relative_date": relative_date,

  // URL
  "is_client": is_client,
  "is_production": is_production,
  "parse_params": parse_params,
  "build_url": build_url,
  "fb_url": fb_url,
  "ajax_url": ajax_url,
  "static_url": static_url,
  "reentrant_url": reentrant_url,
  "legacy_fb_url": legacy_fb_url,
  "fb_api_url": fb_api_url,
  "wiki_url": wiki_url,
  "account_url": account_url,
  "image_url": image_url,
  "lib_base_url": lib_base_url,
  "parse_uri": parse_uri,

  // ROUTING

  "split_path" : split_path,
  "split_extension" : split_extension,
  "normalize_path" : normalize_path,
  "redirect" : redirect,
  "route" : route
};

var self = this;

// Global requires go here


// -------- UTIL ------------


// Used for trimming whitespace
var trimLeft = /^\s+/;
var trimRight = /\s+$/;

// [[Class]] -> type pairs
var class2type = {};
"Boolean Number String Function Array Date RegExp Object".split(" ").forEach(function(c) {
  class2type["[object " + c + "]"] = c.toLowerCase();
});


function type(obj) {
    return obj == null ? String(obj)  : class2type[Object.prototype.toString.call(obj)] || "object";
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

      // slight optimization over original jquery code;
      // use iteration rather than recursion
      var node_stack = [];
      node_stack.push([target, options]);
      while (node_stack.length > 0) {
        var node = node_stack.pop(),
            node_src = node[0],
            node_copy = node[1];

        // Extend the base object
        for (name in node_copy) {
          src = node_src[name];
          copy = node_copy[name];

          // Prevent never-ending loop
          if ( node_src === copy ) {
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
            node_src[name] = clone;
            node_stack.push([clone, copy]);

            // Don't bring in undefined values
          } else if ( copy !== undefined ) {
            node_src[name] = copy;
          }
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


function splice_with_key(list, key, item) {
  for (var i=0,l=list.length; i<l; i++) {
    if (list[i][key] === item[key]) {
      list.splice(i, 1, item);
      return list;
    }
  }
  list.push(item);
  return list;
};


// ------------- MQL ---------------


var LITERAL_TYPE_IDS = {
  "/type/int":1,
  "/type/float":1,
  "/type/boolean":1,
  "/type/rawstring":1,
  "/type/uri":1,
  "/type/text":1,
  "/type/datetime":1,
  "/type/id":1,
  "/type/key":1,
  "/type/value":1,
  "/type/enumeration":1
};

function is_literal_type(type_id) {
  return  LITERAL_TYPE_IDS[type_id] === 1;
};

function to_literal_value(type_id, value /** string **/) {
  if (type_id === "/type/text") {
    return value;
  }
  else if (type_id === "/type/int") {
    return parseInt(value, 10);
  }
  else if (type_id === "/type/float") {
    return parseFloat(value);
  }
  else if (type_id === "/type/boolean") {
    var b = value.toLowerCase();
    return b === "true" || b === "yes";
  }
  else {
    return value;
  }
};


function is_metaweb_system_type(type_id) {
  return (type_id.indexOf("/type/") === 0 ||
          (type_id.indexOf("/common/") === 0 && type_id !== "/common/topic") ||
          (type_id.indexOf("/freebase/") === 0 && type_id.indexOf("_profile") === (type_id.length - 8)));
};


/**
 * Get the type role looking at type hints,
 * /freebase/type_hints/mediator,
 * /freebase/type_hints/enumeration.
 *
 * @param type:Object (required)
 * @param set:Boolean (optional) - Set type[mediator|enumeration] if TRUE
 */
function get_type_role(type, set) {
  var role = {
    mediator: type["/freebase/type_hints/mediator"] === true,
    enumeration: type["/freebase/type_hints/enumeration"] === true
  };
  if (set) {
    type.mediator = role.mediator;
    type.enumeration = role.enumeration;
  }
  return role;
};


function is_reciprocal(prop1, prop2) {
  if (!prop2) {
    return prop1["reverse_property"] || prop1["master_property"];
  }

  //console.log("is_reciprocal", prop1, prop2);

  var otherprop = is_reciprocal(prop1);
  if (otherprop) {
    if (otherprop.id == prop2.id) {
      return true;
    }
    else if (prop2.delegated) {
      if (otherprop.id == prop2.delegated.id) {
        return true;
      }
    }
  }
  otherprop = is_reciprocal(prop2);
  if (otherprop) {
    if (otherprop.id == prop1.id) {
      return true;
    }
    else if (prop1.delegated) {
      if (otherprop.id == prop1.delegated.id) {
        return true;
      }
    }
  }
  return false;
};

function visible_subprops(prop, subprops) {
  if (!subprops) {
    subprops = prop.expected_type.properties || [];
  }
  var visible = [];
  subprops.forEach(function(subprop, i) {
    if (subprop.unique && is_reciprocal(prop, subprop)) {
      return;
    }
    if (unique_ish(subprop.id)) {
      //subprop.unique = true;
    }
    visible.push(subprop);
  });
  return visible;
};

function unique_ish(prop_id) {
  return unique_ish.map[prop_id] === 1;
};

unique_ish.map = (function() {
  var map = {};
  [
    '/people/sibling_relationship/sibling', '/people/marriage/spouse',
    '/fictional_universe/sibling_relationship_of_fictional_characters/siblings',
    '/fictional_universe/marriage_of_fictional_characters/spouses'
  ].forEach(function(pid) {
    map[pid] = 1;
  });
  return map;
})();



/*
 * Simple function for determining whether a schema id (domain, type, property)
 * is part of the "Commons"
 *
 * Expects a schema id (domain id, type id or property id)
 */
function is_commons_id(id) {
  if (/^\/base\//.test(id) || /^\/user\//.test(id)) {
    return false;
  }
  return true;
};

/**
 * Get the key value of a MQL id. If with_ns is TRUE, return a tuple, [namespace, key]
 *
 * id_key("/a/b/c/d") === "d"
 * id_key("/a/b/c/d", true) === ["/a/b/c", "d"]
 */
function id_key(id, with_ns) {
  var parts = id.split("/");
  var key = parts.pop();
  if (with_ns) {
    var ns = parts.join("/");
    if (ns === "") {
      ns = "/";
    }
    return [ns, key];
  }
  else {
    return key;
  }
};

/**
 * @see id_key
 */
function lang_code(lang_id) {
  return id_key(lang_id);
};

/**
 * Assuming a list of types, return appropriate object label
 */
function fb_object_type(types, id) {

    var object_type = "Object";

    // Acre App
    if (types['/freebase/apps/acre_app']) {
      object_type = "Acre App";
    }
    // Domain: user or commons
    else if (types['/type/domain']) {
      if (id.indexOf("/user") === 0 || id.indexOf("/base") === 0) {
        object_type = "User Domain";
      }
      else {
        object_type = "Commons Domain";
      }
    }
    // Type
    else if (types['/type/type']) {
      object_type = "Type";
    }
    // Property
    else if (types['/type/property']) {
      object_type = "Property";
    }
    // Topic
    else if (types['/common/topic']) {
      object_type = "Topic";
    }
    // User
    else if (types['/type/user']) {
      object_type = "User";
    }

    return object_type;
}


/**
 * A utility that handles different types of attributions of an object:
 *
 * {creator: "/user/id"}
 * {creator: {id: "/user/id"}
 * {creator: {id: "/m/id", "attribution": null}}
 */
function get_creator(creator) {
  if (typeof creator === "string") {
    return creator;
  }
  else if (creator) {
    var attribution = creator.attribution;
    if (attribution) {
      return get_creator(attribution);
    }
    return creator.id;
  }
  return null;
};


// ------------- MATH ---------------


/**
 * Round integer to the specified number of zeros
 *
 * round(150, 2) = 200
 * round(1100, 3) = 1000
 * round(1111, 2) = 1100
 */
function round(i,  rnd) {
  rnd = Math.pow(10, rnd);
  return Math.round(i/rnd)*rnd;
};

function format_stat(number) {
  var abbr = ["K", "M", "B", "T"];
  for (var i=abbr.length; i>0; i--) {
    var power = Math.pow(10, i*3);
    if (number >= power) {
      return Math.round(number / power) + abbr[i-1];
    }
  }
  return ""+number;
}


// ------------- SPRINTF ---------------


/**
 sprintf() for JavaScript 0.7-beta1
 http://www.diveintojavascript.com/projects/javascript-sprintf

 Copyright (c) Alexandru Marasteanu <alexaholic [at) gmail (dot] com>
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.
 * Neither the name of sprintf() for JavaScript nor the
 names of its contributors may be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL Alexandru Marasteanu BE LIABLE FOR ANY
 DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


 Changelog:
 2010.09.06 - 0.7-beta1
 - features: vsprintf, support for named placeholders
 - enhancements: format cache, reduced global namespace pollution

 2010.05.22 - 0.6:
 - reverted to 0.4 and fixed the bug regarding the sign of the number 0
 Note:
 Thanks to Raphael Pigulla <raph (at] n3rd [dot) org> (http://www.n3rd.org/)
 who warned me about a bug in 0.5, I discovered that the last update was
 a regress. I appologize for that.

 2010.05.09 - 0.5:
 - bug fix: 0 is now preceeded with a + sign
 - bug fix: the sign was not at the right position on padded results (Kamal Abdali)
 - switched from GPL to BSD license

 2007.10.21 - 0.4:
 - unit test and patch (David Baird)

 2007.09.17 - 0.3:
 - bug fix: no longer throws exception on empty paramenters (Hans Pufal)

 2007.09.11 - 0.2:
 - feature: added argument swapping

 2007.04.03 - 0.1:
 - initial release
 **/

function sprintf() {
  return str_format.apply(null, arguments);
};

function template_sprintf() {
  var len = arguments.length;
  if (len < 2){
    return "";
  }
  // All arguments are stringified before sprintf
  // this converts templates and html encodes strings.
  var args = [acre.markup.stringify(arguments[0])];
  var named_args = arguments[1];
  if (len === 2 && isPlainObject(named_args)) {
    // named args
    named_args = extend({}, named_args);
    for (var k in named_args) {
      named_args[k] = acre.markup.stringify(named_args[k]);
    }
    args.push(named_args);
  }
  else {
    // regular args
    for (var i=1; i<len; i++) {
      args.push(acre.markup.stringify(arguments[i]));
    }
  }
  // This use of bless is considered safe because all of the input
  // has been html encoded so the result can never contain
  // a user supplied script tag. A script tag could only be included
  // via an acre template.
  return acre.markup.bless(sprintf.apply(null, args)); //SAFE(culbertson)
}

function get_type(variable) {
  return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
}
function str_repeat(input, multiplier) {
  for (var output = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */}
  return output.join('');
}

var str_format = function() {
  if (!str_format.cache.hasOwnProperty(arguments[0])) {
    str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
  }
  return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
};

str_format.format = function(parse_tree, argv) {
  var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
  for (i = 0; i < tree_length; i++) {
    node_type = get_type(parse_tree[i]);
    if (node_type === 'string') {
      output.push(parse_tree[i]);
    }
    else if (node_type === 'array') {
      match = parse_tree[i]; // convenience purposes only
      if (match[2]) { // keyword argument
	arg = argv[cursor];
	for (k = 0; k < match[2].length; k++) {
	  if (!arg.hasOwnProperty(match[2][k])) {
	    throw(sprintf('[sprintf] property "%s" does not exist', match[2][k]));
	  }
	  arg = arg[match[2][k]];
	}
      }
      else if (match[1]) { // positional argument (explicit)
	arg = argv[match[1]];
      }
      else { // positional argument (implicit)
	arg = argv[cursor++];
      }

      if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
	throw(sprintf('[sprintf] expecting number but found %s', get_type(arg)));
      }
      switch (match[8]) {
      case 'b': arg = arg.toString(2); break;
      case 'c': arg = String.fromCharCode(arg); break;
      case 'd': arg = parseInt(arg, 10); break;
      case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;
      case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;
      case 'o': arg = arg.toString(8); break;
      case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;
      case 'u': arg = Math.abs(arg); break;
      case 'x': arg = arg.toString(16); break;
      case 'X': arg = arg.toString(16).toUpperCase(); break;
      }
      arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);
      pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
      pad_length = match[6] - String(arg).length;
      pad = match[6] ? str_repeat(pad_character, pad_length) : '';
      output.push(match[5] ? arg + pad : pad + arg);
    }
  }
  return output.join('');
};

str_format.cache = {};

str_format.parse = function(fmt) {
  var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
  while (_fmt) {
    if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
      parse_tree.push(match[0]);
    }
    else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
      parse_tree.push('%');
    }
    else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
      if (match[2]) {
	arg_names |= 1;
	var field_list = [], replacement_field = match[2], field_match = [];
	if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
	  field_list.push(field_match[1]);
	  while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
	    if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
	      field_list.push(field_match[1]);
	    }
	    else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
	      field_list.push(field_match[1]);
	    }
	    else {
	      throw('[sprintf] huh?');
	    }
	  }
	}
	else {
	  throw('[sprintf] huh?');
	}
	match[2] = field_list;
      }
      else {
	arg_names |= 2;
      }
      if (arg_names === 3) {
	throw('[sprintf] mixing positional and named placeholders is not (yet) supported');
      }
      parse_tree.push(match);
    }
    else {
      throw('[sprintf] huh?');
    }
    _fmt = _fmt.substring(match[0].length);
  }
  return parse_tree;
};


var vsprintf = function(fmt, argv) {
  argv.unshift(fmt);
  return sprintf.apply(null, argv);
};


// ------------- CACHE ---------------


/**
 * Helpers for consistently setting the http cache-control headers
 */

var CACHE_POLICIES = {
  "nocache": {
    "private": true,
    "no-cache": true,
    "max-age": 0
  },
  "private": {
    "private": true,
    "max-age": 0,
    "maxage-vary-cookie": "3600|mwLastWriteTime"
  },
  "public": {
    "public": true,
    "max-age": 3600
  }
};

function cache_control(policy, options) {
  options = options || {};
  var cache_options = {};

  if (typeof policy === "string") {
    if (!CACHE_POLICIES[policy]) {
      throw new Error("No cache policy called '"+policy+"'");
    };
    cache_options = extend(cache_options, CACHE_POLICIES[policy], options);
  } else if (typeof policy === "object") {
    cache_options = extend(cache_options, policy);
  }

  var cache_options_list = [];
  for (var key in cache_options) {
    var value = cache_options[key];
    if (typeof value === "string") {
      value = key+'="'+value+'"';
    } else if (typeof value === "number") {
      value = key+'='+value;
    } else {
      value = key;
    }
    cache_options_list.push(value);
  }

  return [cache_options_list.join(", "), cache_options];
}

function set_cache_policy(policy, options, headers) {
  headers = headers || acre.response.headers;
  var [cache_control_value, cache_options] = cache_control(policy, options);
  headers["cache-control"] = cache_control_value;

  if (typeof cache_options["max-age"] === "number") {
    var expires = new Date((new Date()).getTime() + cache_options["max-age"] * 1000);
    headers["expires"] = expires.toUTCString();
  }
}


// ------------- ACCOUNT ---------------


function account_cookie_name() {
  return "fb-account-name";
}

function account_cookie_options(options) {
  return extend({}, {path: "/"}, options);
}

function set_account_cookie(user_info) {
  // Create a cookie containing user information
  if (!user_info || !user_info.id) {
    throw "Could not create account cookie.";
  }

  var long_expire = new Date();
  var account_name = user_info.id.slice(user_info.id.lastIndexOf("/")+1);
  long_expire.setTime(long_expire.getTime() + 30*24*60*60*1000);
  acre.response.set_cookie(account_cookie_name(),
                           account_name,
                           account_cookie_options({expires: long_expire}));
}

function clear_account_cookie() {
  acre.response.clear_cookie(account_cookie_name(), account_cookie_options());
}

function has_account_credentials() {
  if (acre.freebase.apiary_url) {
    return acre.oauth.has_credentials(account_provider());
  } else {
    return !!acre.request.cookies['metaweb-user'];
  }
}

function account_provider() {
  var provider = extend({}, acre.oauth.providers.freebase);
  // Authorize the host that the apiary url is running under,
  // really useful when connecting to a local dev apiary.
  var apiary_host = parse_uri(acre.freebase.apiary_url).host;
  if (apiary_host) {
    provider.domain = apiary_host;
  }
  return provider;
}

function get_account_cookie() {
  var account_name = acre.request.cookies[account_cookie_name()];
  if (!account_name) {
    return null;
  }

  return {
    id: '/user/'+account_name,
    name: account_name
  };
}

function get_active_user() {
  var user = get_account_cookie();
  if (has_account_credentials()) {
    // Only return the user if we have current authentication credentials
    return user;
  } else if (user) {
    // If we no longer are authenticated then get rid of the account name cookie
    clear_account_cookie();
  }

  return null;
}



// ------------- DATE ---------------



// TODO: do not move this acre.require until the circular dependency is figured out
var i18n = acre.require("i18n/i18n.sjs");

/**
 * Relative date relative to current time
 */
function relative_date(d) {
  var c = new Date();

  var  _ = i18n.gettext;

  var delta = c.getTime() - d.getTime();
  var dY = Math.floor(delta / (365 * 24 * 60 * 60 * 1000));
  if (dY > 0) { return dY === 1? _("1 year ago")   : sprintf(_("%s years ago"), dY); }

  var dM = Math.floor(delta / (30 * 24 * 60 * 60 * 1000));
  if (dM > 0)   { return dM === 1? _("1 month ago")  : sprintf(_("%s months ago"), dM); }

  var dD = Math.floor(delta / (24 * 60 * 60 * 1000));
  if (dD > 0)   { return dD === 1? _("1 day ago")    : sprintf(_("%s days ago"), dD); }

  var dH = Math.floor(delta / (60 * 60 * 1000));
  if (dH > 0)   { return dH === 1? _("1 hour ago")   : sprintf(_("%s hours ago"), dH); }

  var dN = Math.floor(delta / (60 * 1000));
  if (dN > 0)   { return dN === 1? _("1 minute ago") : sprintf(_("%s minutes ago"), dN); }
  else if (dN == 0)  { return _("less than a minute ago"); }
  else /*(dN < 0)*/   { return _("in the future???"); }
};




// ------------- URL ---------------


/**
 * Known client urls:
 * http://devel.sandbox-freebase.com
 * http://www.sandbox-freebase.com
 * http://www.freebase.com
 */
function is_client() {
  if (is_client.b == undefined) {
    is_client.b = /\.(freebase|sandbox\-freebase)\.com$/.test(acre.request.server_name);
  }
  return is_client.b;
}

function is_production() {
  if (is_production.b == undefined) {
    is_production.b = /www\.freebase\.com$/.test(acre.request.server_name);
  }
  return is_production.b;
}

/**
 * params can be an array of tuples so that we can use url builders
 * in mjt templates.
 *
 * @param params:Object,Array (optional) - Query string parameters can be
 *                                         a dictonary of {name: value, ...} or
 *                                         an array of [ [name, value] .., ] tuples.
 */
function parse_params(params) {
  // [ [name1,value1], [name2,value2], ...]
  if (isArray(params)) {
    var dict = {};
    params.forEach(function([name,value]) {
      dict[name] = value || "";
    });
    return dict;
  }
  return params;
}


/**
 * All url helpers take variable number of arguments (varargs),
 * where you can pass it a list of paths followed by
 * a querystring dicionary or tuple array (@see parse_params).
 *
 * xxx_url(path1, path2, path3, ..., params) => path1 + path2 + path3 + ? + $.params(params)
 */


/**
 * build url
 * Use to construct urls to any host
 * (i.e, host/path?params)
 */
function build_url(host /**, path1, path2, ..., params **/) {
  if (host && host.indexOf('://') === -1) {
    throw "Host must contain scheme: " + host;
  }
  var url = (host || "");
  var path;
  var params;
  if (arguments.length > 1) {
    var args = Array.prototype.slice.call(arguments);
    args.shift();
    var paths = [];

    for(var i=0,l=args.length; i<l; i++) {
      var arg = args[i];
      var t = type(arg);
      if (t === "string") {
        paths.push(arg);
      }
      else {
        // last argument(s) are the params dictionary or array
        params = {};
        for (var j=i; j<l; j++) {
          params = extend(params, parse_params(args[j]));
        }
        break;
      }
    };
    path = paths.join("");
  }
  if (path && path.indexOf("/") !== 0) {
    throw "Path must begin with a '/': " + path;
  }
  if (path) {
    url += path;
  }
  if (url === "") {
    url = "/";
  }
  return acre.form.build_url(url, params);
};


/**
 * freebase url
 * Use to link to pages on freebase.com
 * (i.e, http://www.freebase.com/path?params)
 *
 * id is optional, and if not included then
 * params takes precidents
 */
function fb_url() {
  var args = Array.prototype.slice.call(arguments);
  var absolute = false;
  if (args.length && typeof args[0] === "boolean") {
    absolute = args.shift();
  }
  if (absolute) {
    args.unshift(acre.freebase.site_host);
  }
  else {
    args.unshift(null); // host is null to specify relative url
  }
  if (i18n.lang !== "/lang/en") {
    args.push({lang:i18n.lang});
  }
  return build_url.apply(null, args);
};

/**
 * Create an ajax reenrant url: /ajax/...
 *
 * ajax_url can take a full app path syntax (e.g., //1a.schema.www.trunk.svn.freebase-site.googlecode.dev)
 * or a regular path.
 *
 * If a regular path and starts with "lib/" (without a beginning "/"),
 * the ajax url will be mapped to the lib app which is acre.current_script.app.path:
 *
 * ajax_url("lib/path") => /ajax/lib.www.trunk/path
 *
 * All other paths will default to the current request script app path which is acre.request.script.app.path:
 *
 * ajax_url("path") => /ajax/app.www.trunk/path
 * ajax_url("/path") => /ajax/app.www.trunk/path
 */
function ajax_url(path, params) {
  var args = Array.prototype.slice.call(arguments);
  args.unshift("/ajax");
  return reentrant_url.apply(null, args);
};

/**
 * Create a static reentrant url: /static/...
 *
 * @see ajax_url
 */
function static_url(path) {
  var args = Array.prototype.slice.call(arguments);
  args.unshift("/static");
  return reentrant_url.apply(null, args);
};

function reentrant_url(prefix, path) {
  path = resolve_reentrant_path(path);
  path = path.replace(/^\/\//, prefix + "/");
  path = path.replace(".svn.freebase-site.googlecode.dev", "");
  var args = Array.prototype.slice.call(arguments, 2);
  args.unshift(path);
  args.unshift(null); // relative url
  return build_url.apply(null, args);
};

function resolve_reentrant_path(path) {
  path = path || "";
  if (path.indexOf("//") == 0) {
    return path;
  }
  if (path.indexOf("lib/") === 0) {
    return acre.current_script.app.path + path.substring(3);
  }
  else {
    if (path && path[0] != "/") {
      path = "/" + path;
    }
    return acre.request.script.app.path + path;
  }
};

/**
 * legacy freebase url
 * Use for pages that haven't been ported to acre yet
 * (i.e, http://www.freebase.com/path?params)
 */
function legacy_fb_url() {
  var args = Array.prototype.slice.call(arguments);
  var host = acre.freebase.site_host
    .replace(/^(https?\:\/\/)([^\.]+)\./, '$1www.')
    .replace(':'+acre.request.server_port, '');
  args.unshift(host);
  return build_url.apply(null, args);
}

/**
 * freebase api url
 * Use for links to freebase apis
 * (i.e., http://api.freebase.com/path?params)
 */
function fb_api_url() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift(acre.freebase.service_url);
  return build_url.apply(null, args);
};

/**
 * freebase wiki url
 * Use for links to the freebase wiki
 * (i.e., http://wiki.freebase.com/wiki//<page>)
 *
 * Note that this is a little bit different from other forms of url helpers
 * in that the path, "/wiki/" is automatically prepended to the page parameter
 * so that you only need to pass the name of the wiki page
 *
 * wiki_url("Enumerated_type") => http://wiki.freebase.com/wiki/Enumerated_type
 */
function wiki_url(page) {
  var args = Array.prototype.slice.call(arguments);
  args.unshift("http://wiki.freebase.com", "/wiki/");
  return build_url.apply(null, args);
};

/**
 * Get the signin/signout urls depending on environment.
 */
function account_url(kind, return_url) {
  var url;
  switch (kind) {
   case "signin":
    url = legacy_fb_url('/signin/login', {
      mw_cookie_scope: 'domain',
      onsignin: return_url
    });
    break;
   case "signout":
    url = fb_api_url('/api/account/logout', {
      mw_cookie_scope: 'domain',
      onsucceed: return_url
    });
    break;
   case "register":
    url = legacy_fb_url('/signin/register', {
      onsucceed: return_url
    });
    break;
   case "settings":
    url = legacy_fb_url('/user/account', {
      done: return_url
    });
    break;
  default :
    throw "Must pass 'kind' to account_url";
  }

  return url.replace(/^http/, "https");
}

/**
 * image_thumb takes an image guid and creates a blob url for fetching that image. It also passes
    appropriate dimension/cropping parameters.
    id: guid of image
    maxheight/maxwidth: maximum size of that dimension
    cropwidth: size of crop
    raw: do not user the thumbnailing service - return the raw image with the original dimensions
*/
function image_url(id, params) {
  params = extend({
    id: id,
    maxheight: null,
    maxwidth: null,
    mode: "fit",
    use: null,
    pad: null,
    onfail: null,
    errorid: "/freebase/no_image_png"
  }, parse_params(params));

  for (var key in params) {
    if (params[key] === null || params[key] === undefined) {
      delete params[key];
    }
  }

   return acre.freebase.imgurl(id, params.maxwidth, params.maxheight, params.mode, params.errorid);
  //return fb_api_url("/api/trans/image_thumb", params);
}

function lib_base_url(key) {
  var md = acre.get_metadata();
  var lib = md.libs[key];
  return lib.base_url + lib.version;
}

/**
 * parse uri
 * Used to convert a url string into ints components parts
 *
 * Adapted from parseUri 1.2.2
 * (c) Steven Levithan <stevenlevithan.com>
 * MIT License
 */
function parse_uri(str) {
  var o = {
    key: [
      "source", "protocol", "authority", "userInfo", "user",
      "password", "host", "port", "relative", "path",
      "directory", "file", "query", "anchor"
    ],
    q: {
      name: "params",
      parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
  };

  var m = o.parser.exec(str);
  var uri = {};
  var i = 14;

  while (i--) uri[o.key[i]] = m[i] || "";

  uri[o.q.name] = {};
  uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
    if ($1) uri[o.q.name][$1] = $2;
  });

  return uri;
}

// -----Functions for routing -----


/**
 * Split path to script_id and path_info pairs. This is not like an ordinary path split.
 *
 * /foo.bar/baz/fu?k=v => ['foo.bar', '/baz/fu', 'k=v']
 *
 * NOTE: The path MUST begin with "/" but the resulting script_id DOES NOT start with "/".
 * The script_id defaults to "index" if path is "/".
 *
 * @param path:String (required)
 * @return a pair of [script_id, path_info] where "/" + script_id + path_info = path.
 */
function split_path(path) {
  var query_string = null;
  if (path.indexOf("?") !== -1) {
    var [path, query_string] = path.split("?", 2);
  }
  var path_segs = path.split("/");
  path_segs.shift();
  var script_id = path_segs.shift() || "index";
  return [script_id, "/" + path_segs.join("/"), query_string];
};


/**
 * Split path into a pair of [root, ext] where root + "." + ext = path.
 *
 * /foo/bar/baz.png => [/foo/bar/baz, png]
 *
 * The ext defaults to "sjs" if there is no extension.
 *
 * @param path:String (required)
 * @return a pair of [root, ext] where root + "." + ext = path.
 */
function split_extension(path) {
  var i = path.lastIndexOf(".");
  if (i !== -1) {
    return [path.substring(0, i), path.substring(i+1)];
  }
  return [path, "sjs"];
};

/**
 * Normalize path of the request scope and redirect if necessary.
 * A request path is normalized by removing trailing /index/* from the request path and performing a redirect
 */
function normalize_path(scope) {
  var req = scope.acre.request;
  var parts = req.url.split("?");
  var base_url = parts.shift();
  var path_info = req.path_info;
  if (redirect && (/\/index\/*$/.test(base_url))) {
    // redirect /index in request path
    redirect(scope, base_url.replace(/\/index.*$/, ""));
  }
  /**
   * path_info defaults "/" to "/index", so for consistency, convert "/" and "/index" to "/"
   * and treat it as the root namespace id ("/")
   */
  if (/^\/index$/.test(path_info)) {
    path_info = "/";
  }
  return path_info;
};

/**
 * Route: script + path + query_string (scope.acre.request.query_string if any), within the request scope.
 */
function route(scope, script, path) {
  if (script === "/") {
    script = "index.controller";  // default to index.controller
  }
  script = script.replace(/^\/*/, "");
  script = scope.acre.resolve(script);
  if (path) {
    script += path;
  }
  var qs = scope.acre.request.query_string;
  if (qs) {
    script += ("?" + qs);
  }
  scope.acre.route(script);
};

/**
 * 301 Redirect: path + query_string (scope.acre.request.query_string if any), within the request scope.
 */
function redirect(scope, path) {
  var qs = scope.acre.request.query_string;
  if (qs) {
    path += ("?" + qs);
  }
  scope.acre.response.status = 301;
  scope.acre.response.set_header("location", path);
  scope.acre.exit();
};



// -----Functions for extending helpers -----


function extend_helpers(external_helper) {

  if (external_helper.exports && typeof external_helper.exports === "object") {
    for (var n in self.exports) {
        if (n in external_helper) {
            throw("Multiple helper method defined with the same name: " + n);
        }
        external_helper[n] = external_helper.exports[n] = self.exports[n];
    }
  }

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
