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

var mf = acre.require("MANIFEST").mf;
var h = mf.require("core", "helpers");

var Class = {
  factory: function(clazz, clazz_args) {
    function F(args) {
      return clazz.apply(this, args);
    };
    F.prototype = clazz.prototype;
    return new F(clazz_args);
  }
};

function Invalid() {
  var args = [];
  for (var i=0, l=arguments.length; i<l; i++) {
    args.push(arguments[i]);
  }
  this.message = args.join(" ");
};
Invalid.prototype = new Error();


/**
 * A factory to create a new Invalid with var args.
 *
 * throw(Invalid.fatory.apply(null, [arg1, arg2, ...]));
 */
Invalid.factory = function() {
  return Class.factory(Invalid, arguments);
};


function IfException(val) {
  this.val = val;
};
function IfEmpty(val) {
  this.val = val;
};
IfEmpty.prototype = new IfException();

function IfInvalid(val) {
  this.val = val;
};
IfInvalid.prototype = new IfException();


/**
 * The base class for all validator classes.
 *
 * This is an attempt to mimic python's excellent FormEncode validation library
 * in a javascript-y way (http://formencode.org).
 * This does not have all the bells and whistles of the FormEncode library
 * but does make it easy to write your own custom validator based on this class.
 *
 * Here's a way you can write your validator leveraging the base Validator class:
 *
 * var scope = this; // current scope
 * Validator.factory(scope, "MyValidator", {
 *   "array": function(val, options) {...},
 *   "dict": function(val, options) {...}
 * });
 *
 * This will create a MyValidator object in the current scope, which then you will be able to call it directly:
 *
 * var validated = MyValidator(val, options);
 *
 * or
 *
 * var validated = MyValidator(obj, "key", options);
 *
 * You can choose to implement zero or more typeof's methods for the input value. The above example only
 * allows values that are typeof "array" or "dict". For everything else, the base Validator class will
 * thrown an Invalid exception (if the if_invalid option is not specified).
 *
 * The Validator class conveniently distinguishes (typeof val == "object") into "dict", "array" or "null".
 *
 * @param val (required) - Any value that you want validated
 * @param options:Ojbect (optional) - Options
 */
function Validator(/** (val, options) OR (obj, key, options) **/) {
  //return new Validator.Class(obj, key, options);
  return Class.factory(Validator.Class, arguments).to_js();
};

Validator.usage = "usage: Validator(val, options) OR Validator(obj, key, options)";

Validator.Class = function(/** (val, options) OR (obj, key, options) **/) {
  this.init.apply(this, arguments);
};
Validator.factory = function(scope, name, prototype) {
  scope[name] = function(/** (val, options) OR (obj, key, options) **/) {
    return Class.factory(scope[name].Class, arguments).to_js();
  };
  scope[name].Class = function(/** (val, options) OR (obj, key, options) **/) {
    this.init.apply(this, arguments);
  };
  h.extend(scope[name].Class.prototype, Validator.Class.prototype, prototype);
  return scope[name];
};

Validator.Class.prototype = {
  init: function(/** (val, options) OR (obj, key, options) **/) {
    var args = arguments;
    var len = args.length;
    if (len === 0 || len > 3) {
      throw(Invalid.factory(Validator.usage));
    }
    if (len > 1 && typeof args[1] === "string") {
      this.key = args[1];
      this.val = args[0][this.key];
      this.options = len === 3 ? args[2] : null;
    }
    else {
      this.key = "value";
      this.val = args[0];
      this.options = len == 2 ? args[1] : null;
    }
    this.options = h.extend({}, this.defaults, this.options);
  },
  defaults: {
    strip: true   // strip beginning/ending whitespaces if string
    // if_empty
    // if_invalid
    // required
  },
  to_js: function() {
    if (typeof this.val === "string" && this.options.strip) {
      this.val = this.strip(this.val);
    }
    try {
      this.pre_to_js(this.val, this.options);
      var js_val = this[this.get_typeof(this.val)](this.val, this.options);
      this.post_to_js(js_val, this.options);
      return js_val;
    }
    catch(e if e instanceof IfException) {
      return e.val;
    }
  },
  get_typeof: function(val) {
    var t = typeof val;
    if (t === "object") {
      if (val === null) {
        t = "null";
      }
      else if (this.is_array(val)) {
        t = "array";
      }
      else {
        t = "dict";
      }
    }
    return t;
  },
  pre_to_js: function(val, options) {
    return this.check_empty(val, options);
  },
  post_to_js: function(val, options) {
    return this.check_empty(val, options);
  },
  check_empty: function(val, options) {
    if (this.is_empty(val)) {
      if ("if_empty" in options) {
        throw(new IfEmpty(options.if_empty));
      }
      if (options.required) {
        this.invalid(this.key, "is required");
      }
    }
  },
  invalid: function() {
    if ("if_invalid" in this.options) {
      throw(new IfInvalid(this.options.if_invalid));
    }
    throw(Invalid.factory.apply(null, arguments));
  },
  /**
   * @return TRUE if val is null, undefined, "", [], or {}. False otherwise.
   */
  is_empty: function(val) {
    var t = this.get_typeof(val);
    if (t === "null") {
      return true;
    }
    else if (t === "undefined") {
      return true;
    }
    else if (t === "string") {
      return val === "";
    }
    else if (t === "array") {
      return val.length === 0;
    }
    else if (t === "dict") {
      return this.is_empty_object(val);
    }
    return false;
  },
  is_empty_object: function(obj) {
    for ( var name in obj ) {
      return false;
    }
    return true;
  },
  is_array: function(val) {
    return toString.call(val) === "[object Array]";
  },
  strip: function(str) {
    return str.replace(/^\s+|\s+$/g, "");
  },

  //
  // Subclasses must overwrite to validate
  // each typeof the original value.
  // By default throws Invalid error.
  //

  "boolean": function(val, options) {
    this.invalid("boolean type");
  },
  "string": function(val, options) {
    this.invalid("string type");
  },
  "number": function(val, options) {
    this.invalid("number type");
  },
  "undefined": function(val, options) {
    this.invalid("undefined type");
  },
  "function": function(val, options) {
    this.invalid("function type");
  },
  "null": function(val, options) {
    this.invalid("null type");
  },
  "array": function(val, options) {
    this.invalid("array type");
  },
  "dict": function(val, options) {
    this.invalid("dict type");
  }
};

// Validators for each possible typeof's. These simple validators only accept it's own typeof.
var scope = this;
["Boolean", "String", "Number", "Undefined", "Function", "Null", "Array", "Dict"].forEach(function(type) {
  var proto = {};
  proto[type.toLowerCase()] = function(val, options) {
    return val;
  };
  Validator.factory(scope, type, proto);
});

/**
 * StringBool, StringBoolean
 */
var StringBool = Validator.factory(scope, "StringBoolean", {
  "boolean": function(val, options) {
    return val;
  },
  "string": function(val, options) {
    val = val.toLowerCase();
    if (val === "" || val === "false" || val === "no" || val === "0") {
      return false;
    }
    return true;
  },
  "number": function(val, options) {
    return val !== 0;
  },
  "undefined": function(val, options) {
    return false;
  },
  "null": function(val, options) {
    return false;
  },
  "array": function(val, options) {
    return val.length > 0;
  },
  "dict": function(val, options) {
    return !this.is_empty_object(val);
  }
});

/**
 * Guid
 */
function NotAGuid(message) {
  this.message = message;
};
NotAGuid.prototype = new Invalid();

function validate_guid(val) {
  if (val[0] === "#") {
    if (val === "#00000000000000000000000000000000") {
      throw(new NotAGuid(val));
    }
    if (/^\#[0-9a-f]{32}$/.test(val)) {
      return val;
    }
  }
  throw(new NotAGuid(val));
};

Validator.factory(scope, "Guid", {
  "string": function(val, options) {
    try {
      return validate_guid(val);
    }
    catch (e if e instanceof NotAGuid) {
      return this.invalid(this.key, val, "is not a guid");
    }
  }
});

/**
 * MqlId
 */
Validator.factory(scope, "MqlId", {
  "defaults": {
    "guid": false,   // allow guid #9202a8c04000641f8000000003e00cc6
    "reverse": false // allow !/film/film/starring
  },
  "string": function(val, options) {
    if (options.guid) {
      try {
        return validate_guid(val);
      }
      catch(e if e instanceof NotAGuid) {
        // ignore
      }
    }
    if (options.reverse && val.length > 2 && val.indexOf("!/") === 0) {
        return val;
    }
    if (val.indexOf("/") === 0) {
      if (val.length > 1) {
        if (val.substring(val.length - 1) !== "/") {
          return val;
        }
      }
      else {
        return val;
      }
    }
    return this.invalid(this.key, val, "is not a mql id");
  }
});


/**
 * OneOf
 */
Validator.factory(scope, "OneOf", {
  "defaults": {
    oneof: []
  },
  "boolean": function(val, options) {
    return this.check_oneof(val, options);
  },
  "string": function(val, options) {
    return this.check_oneof(val, options);
  },
  "number": function(val, options) {
    return this.check_oneof(val, options);
  },
  "undefined": function(val, options) {
    return this.check_oneof(val, options);
  },
  "null": function(val, options) {
    return this.check_oneof(val, options);
  },
  check_oneof: function(val, options) {
    if (this.is_array(options.oneof)) {
      for (var i=0,l=options.oneof.length; i<l; i++) {
        if (val === options.oneof[i]) {
          return val;
        }
      }
      return this.invalid(this.key, val, "is not one of", JSON.stringify(options.oneof));
    }
    return this.invalid("oneof option not an array");
  }
});



/**
 * Timestamp (must pass acre.freebase.date_from_iso)
 */
Validator.factory(scope, "Timestamp", {
  "defaults": {
    date: false  // convert to date
  },
  "string": function(val, options) {
    var date;
    try {
      date = acre.freebase.date_from_iso(val);
      if (!date) {
        throw(date);
      }
    }
    catch (ex) {
      return this.invalid(this.key, val, "is not a valid ISO8601 date string");
    }
    if (options.date) {
      return date;
    }
    else {
      return val;
    }
  }
});


/**
 * Integer
 * if isNaN, invalid
 */
Validator.factory(scope, "Int", {
  "string": function(val, options) {
    return this.integer(val, options);
  },
  "number": function(val, options) {
    return this.integer(val, options);
  },
  "integer": function(val, options) {
    try {
      var i = parseInt(val);
      if (isNaN(i)) {
        return this.invalid(this.key, val, "is not a valid integer");
      }
      return i;
    }
    catch (ex) {
      return this.invalid(this.key, val, "is not a valid integer");
    }
  }
});

/**
 * Integer
 * if isNaN, invalid
 */
Validator.factory(scope, "Float", {
  "string": function(val, options) {
    return this["float"](val, options);
  },
  "number": function(val, options) {
    return this["float"](val, options);
  },
  "float": function(val, options) {
    try {
      var i = parseFloat(val);
      if (isNaN(i)) {
        return this.invalid(this.key, val, "is not a valid float");
      }
      return i;
    }
    catch (ex) {
      return this.invalid(this.key, val, "is not a valid float");
    }
  }
});



var schema_key_proto = {
  defaults: {
    minlen: 1
  },
  "string": function(key, options) {
    var minlen = options.minlen;
    if (!minlen) {
      minlen = 1;
    }
    if (minlen === 1 && key.length === 1) {
      if (/^[a-z]$/.test(key)) {
        return key;
      }
    }
    else {
      var pattern = "^[a-z][a-z0-9_]";
      if (minlen > 1) {
        pattern += "{" + (minlen - 1) + ",}$";
      }
      else {
        pattern += "+$";
      }
      var re = RegExp(pattern);
      if (re.test(key)) {
        if (! (key.match(/__+/) ||
               key.match(/[^a-z0-9]+$/))) {
          return key;
        }
      }
    }
    var msg;
    if (minlen > 1) {
      msg = "Key must be " + minlen + " or more alphanumeric characters";
    }
    else {
      msg = "Key must be alphanumeric";
    }
    msg += ", lowercase, begin with a letter and not end with a non-alphanumeric character. Underscores are allowed but not consecutively.";
    return this.invalid(this.key, key, (msg));
  }
};

Validator.factory(scope, "DomainKey", h.extend({}, schema_key_proto, {defaults:{minlen:5}}));
Validator.factory(scope, "TypeKey", h.extend({}, schema_key_proto));
Validator.factory(scope, "PropertyKey", h.extend({}, schema_key_proto));
