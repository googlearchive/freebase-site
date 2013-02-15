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
var i18n = acre.require("i18n/i18n.sjs");

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

function IfMissing(val) {
  this.val = val;
};
IfMissing.prototype = new IfException();

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
    // if_missing
    // if_invalid
    // required
  },
  to_js: function() {
    if (typeof this.val === "string" && this.options.strip) {
      this.val = this.strip(this.val);
    }
    try {
      this.pre_to_js(this.val, this.options);
      var js_val = this[this.get_typeof(this.val)].apply(this, [this.val, this.options]);
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
      else if (h.isArray(val)) {
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
    var is_undefined = this.is_undefined(val);
    var is_empty = this.is_empty(val);

    if (is_undefined || is_empty) {
      if (is_undefined && "if_missing" in options) {
        throw(new IfMissing(options.if_missing));
      }
      else if (is_empty && "if_empty" in options) {
        throw(new IfEmpty(options.if_empty));
      }
      if (options.required) {
        this.invalid(this.key, "is required");
      }
    }
/**    if (this.is_empty(val)) {
      if ("if_empty" in options) {
        throw(new IfEmpty(options.if_empty));
      }
      if (options.required) {
        this.invalid(this.key, "is required");
      }
    }
**/
  },
  invalid: function() {
    if ("if_invalid" in this.options) {
      throw(new IfInvalid(this.options.if_invalid));
    }
    throw(Invalid.factory.apply(null, arguments));
  },

  is_undefined: function(val) {
    return this.get_typeof(val) === "undefined";
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
["Boolean", "String", "Number", "Undefined", "Function", "Null", "Dict"].forEach(function(type) {
  var proto = {};
  proto[type.toLowerCase()] = function(val, options) {
    return val;
  };
  Validator.factory(scope, type, proto);
});

Validator.factory(scope, "Array", {
  "defaults": {
    length: null  // specify number >= 0 to assert length of array
  },
  "array": function(val, options) {
    if (options.length != null && val.length !== options.length) {
      return this.invalid(this.key, val, "is not of length: " + options.length);
    }
    return val;
  }
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

var mqlkey_start = 'A-Za-z0-9';
var mqlkey_char = 'A-Za-z0-9_-';

var mqlkey_fast = /^[_A-Za-z0-9][A-Za-z0-9_-]*$/;
var mqlkey_slow = /^(?:[A-Za-z0-9]|\$[A-F0-9]{4})(?:[A-Za-z0-9_-]|\$[A-F0-9]{4})*$/;

function check_mqlkey(val) {
  if (mqlkey_fast.test(val)) {
    return true;
  }
  else if (mqlkey_slow.test(val)) {
    return true;
  }
  return false;
};


/**
 * MqlKey
 *
 * TODO: allow mql quoted values (i.e, $XXXX)
 */

Validator.factory(scope, "MqlKey", {
  "string": function(val, options) {
    if (check_mqlkey(val)) {
      if (reserved_word(val.toLowerCase())) {
        return this.invalid(this.key, val, "is a reserved word.");
      }
      return val;
    }
    return this.invalid(this.key, val, "is invalid MQL key");
  }
});

/**
 * MqlId
 *
 * TODO: allow mql quoted values (i.e, $XXXX)
 */
Validator.factory(scope, "MqlId", {
  "string": function(val, options) {
    if (val === "/") {
      return val;
    }
    if (h.startsWith(val, "/")) {
      var mqlkeys = val.split("/");
      mqlkeys.shift();  // remove beginning "/"
      for (var i=0,l=mqlkeys.length; i<l; i++) {
        if (!check_mqlkey(mqlkeys[i])) {
          return this.invalid(this.key, val, "is not a mql id");
        }
      }
      return val;
    }
    return this.invalid(this.key, val, "is not a mql id");
  }
});

/**
 * LangId
 *
 * Accepts full lang ids ("/lang/ko") or lang codes ("ko")
 * This always return the full lang id.
 *
 * LangId("/lang/ko") == "/lang/ko"
 * LangId("ko") === "/lang/ko"
 */
var r_LangId= /^\/lang\/[A-Za-z0-9][A-Za-z0-9_-]*$/;
Validator.factory(scope, "LangId", {
  "string": function(val, options) {
    if (r_LangId.test(val)) {
      return val;
    }
    else if (check_mqlkey(val)) {
      /**
       * Allow simple lang code parameters like lang=ko instead of (lang=%2Flang%2Fko).
       */
      return h.lang_id(val);
    }
    return this.invalid(this.key, val, "is invalid lang");
  }
});

/**
 *
 * Username
 */
var username = /^[a-z][a-z0-9_]*$/;
Validator.factory(scope, "Username", {
  "string": function(val, options) {
    if (username.test(val)) {
      return val;
    }
    return this.invalid(this.key, val, "is an invalid username");
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
    if (h.isArray(options.oneof)) {
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
 * RegExp for iso8601 date
 * m[1] = year
 * m[2] = month
 * m[3] = day
 *
 * m[>1] are optional
 */
var iso_date = "([\\+\\-]?\\d{4,})(?:-(0[1-9]|1[0-2])(?:-([12]\\d|0[1-9]|3[01]))?)?";

/**
 * RegExp for iso8601 time
 * m[1] = hours
 * m[2] = minutes
 * m[3] = seconds
 * m[4] = fractional second (ie, .001)
 * m[5] = Z or UTC offset (i.e., -08:00)
 * m[6] = offset sign (+/-)
 * m[7] = offset hours
 * m[8] = offset minutes
 *
 * m[>1] are optional
 */
var iso_time = "([01]\\d|2[0-3])(?:\\:([0-5]\\d)(?:\\:([0-5]\\d))?)?(\\.\\d+)?([zZ]|([+-])([01]\\d|2[0-3])(?:\\:([0-5]\\d))?)?";

/**
 * RegExp for iso8601 datetime
 * m[1] = matched date
 * m[2] = year
 * m[3] = month
 * m[4] = day
 * m[5] = matched time
 * m[6] = hours
 * m[7] = minutes
 * m[8] = seconds
 * m[9] = fractional second (ie, .001)
 * m[10] = Z or UTC offset (i.e., -08:00)
 * m[11] = UTC offset sign (+/-)
 * m[12] = UTC offset hours
 * m[13] = UTC offset minutes
 */
var iso_datetime_regex = new RegExp('^(' + iso_date + ')(?:T(' + iso_time + '))?$');

/**
 * Timestamp (must pass iso_datetime_regex)
 */
Validator.factory(scope, "Timestamp", {
  "defaults": {
    date: false  // convert to date
  },
  "string": function(val, options) {
    // Hack for special MQL value
    if (val === "__now__") {
      return options.date ? new Date() : val;
    }
    if (options.date) {
        var m = iso_datetime_regex.exec(val);
        if (m) {
            var year = parseInt(m[2], 10);
            var month = m[3] != null ? parseInt(m[3], 10) - 1 : 0;
            var date = m[4] != null ? parseInt(m[4], 10) : 1;
            var hours = m[6] != null ? parseInt(m[6], 10) : 0;
            var minutes = m[7] != null ? parseInt(m[7], 10) : 0;
            var seconds = m[8] != null ? parseInt(m[8], 10) : 0;
            var milliseconds = m[9] != null ? parseFloat(m[9], 10) : 0;
            milliseconds = milliseconds * 1000; // 0 - 999
            var offsethours = m[12] != null ? parseInt(m[12], 10) : 0;
            var offsetminutes = m[13] != null ? parseInt(m[13], 10) : 0;
            if (m[11] === "+") {
                hours -= offsethours;
                minutes -= offsetminutes;
            }
            else if (m[11] === "-") {
                hours += offsethours;
                minutes += offsetminutes;
            }
            var d = new Date();
            d.setUTCFullYear(year, month, date);
            d.setUTCHours(hours, minutes, seconds, milliseconds);
            return d;
        }
        else {
            return this.invalid(this.key, val, "is not a valid ISO8601 date string");
        }
    }
    else if (iso_datetime_regex.test(val)) {
        return val;
    }
    else {
        return this.invalid(this.key, val, "is not a valid ISO8601 date string");
    }
  }
});


/**
 * Validate /type/datetime values
 */
Validator.factory(scope, "Datetime", {
    "string": function(val, options) {
        var date;
        try {
            date = acre.freebase.date_from_iso(val);
            if (date) {
                return val;
            }
        }
        catch (ex) {
            // not a valid iso date
        }
        if (i18n.iso8601.is_time(val)) {
            // is it a iso time?
            if (val.indexOf("T") === 0) {
                val = val.substring(1);
            }
            return val;
        }
        return this.invalid(this.key, val, "is not a valid datetime string");
    }
});

/**
 * Integer
 * if isNaN, invalid
 */
Validator.factory(scope, "Int", {
  "string": function(val, options) {
    return this["int"](val, options);
  },
  "number": function(val, options) {
    return this["int"](val, options);
  },
  "int": function(val, options) {
    try {
      var i = parseInt(val, 10);
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



/***
 * If you change schema key validation logic please update:
 *
 * lib/validator/validators.sjs
 * schema/helpers.sjs
 * lib/propbox/jquery.mqlkey.js
 */

// from python client mw.utils
var reserved = null;
var reservedwords = 'meta typeguid left right datatype scope attribute relationship property link class future update insert delete replace create destroy default sort limit offset optional pagesize cursor index !index for while as in is if else return count function read write select var connect this self super xml sql mql any all macro estimate-count';
var typeonlywords = 'guid id object domain name key type keys value timestamp creator permission namespace unique schema reverse';

function reserved_word(word) {
  if (!reserved) {
    reserved = {};
    // lazily build up reserved word dictionary
    [reservedwords, typeonlywords].forEach(function(l) {
      l.split(' ').forEach(function(word) {
        reserved[word] = 1;
      });
    });
  }
  return reserved[word] === 1;
};

var schema_key_start = 'a-z';
var schema_key_char = 'a-z0-9_';

var schema_key_proto = {
  defaults: {
    minlen: 1
  },
  "string": function(key, options) {
    var minlen = options.minlen;
    if (!minlen) {
      minlen = 1;
    }
    if (reserved_word(key)) {
      return this.invalid(this.key, key, " is a reserved word.");
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



/**
 * MultiValue
 */
Validator.factory(scope, "MultiValue", {
  defaults: {
    validator: null,
    allow_null: false
  },
  "boolean": function(val, options) {
    return this.native_value(val, options);
  },
  "string": function(val, options) {
    return this.native_value(val, options);
  },
  "number": function(val, options) {
    return this.native_value(val, options);
  },
  "undefined": function(val, options) {
    return this.native_value(val, options);
  },
  "null": function(val, options) {
    return this.native_value(val, options);
  },
  "array": function(val, options) {
    return this.check_null(val.map(function(v) {
      if (options.validator) {
        v = options.validator(v, options);
      }
      return v;
    }), options);
  },
  "dict": function(val, options) {
    return this.native_value(val, options);
  },
  native_value: function(val, options) {
    if (options.validator) {
      val = options.validator(val, options);
    }
    return this.check_null([val], options);
  },
  check_null: function(arr, options) {
    return arr.filter(function(val) {
      if (val == null && !options.allow_null) {
        return false;
      }
      return true;
    });
  }
});



/**
 * JSON
 */
Validator.factory(scope, "Json", {
  "defaults": {
    json: true  // return object
  },
  "string": function(val, options) {
    try {
      var o = JSON.parse(val);
      return options.json ? o : val;
    }
    catch(ex) {
      return this.invalid("Invalid JSON", ex);
    }
  }
});



/***
 * Uri
 */
var regex_uri;
Validator.factory(scope, "Uri", {
  "string": function(val, options) {
    if (!regex_uri) {
      regex_uri = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
    }
    if (regex_uri.test(val)) {
      return val;
    }
    return this.invalid(this.key, val, "is invalid URI");
  }
});

/**
 * JSONP callback parameter name validator
 */
var js_reserved = null;
var js_reservedwords = "alert break case catch continue debugger default delete do else finally for function if in instanceof new return switch this throw try typeof var void while with class enum export extends import super implements interface let package private protected public static yield null true false";
function js_reserved_word(word) {
    if (!js_reserved) {
        js_reserved = {};
        js_reservedwords.split(" ").forEach(function(word) {
            js_reserved[word] = 1;
        });
    }
    return js_reserved[word] === 1;
};

var regex_jsonp;
Validator.factory(scope, "Jsonp", {
    string: function(val, options) {
        if (!regex_jsonp) {
            regex_jsonp = /^[\w]+$/;
        }
        if (regex_jsonp.test(val)) {
            if (js_reserved_word(val)) {
                return this.invalid(this.key, val, "is a javascript reserved word");
            }
            return val;
        }
        return this.invalid(this.key, val, "is invalid JSONP parameter name");
    }
});

/**
 * Acre validators
 */

Validator.factory(scope, "AcreHost", {
  "string": function(val) {
    var acre_host = /^[0-9a-z][0-9a-z\-\.]+$/;
    if (acre_host.test(val)) {
      return val;
    }
    return this.invalid(this.key, val, "is an invalid hostname");
  }
});

Validator.factory(scope, "AcreAppKey", {
  "string": function(val) {
    var app_key = /^[a-z][\-0-9a-z]{0,20}$/;
    if (app_key.test(val)) {
      return val;
    }
    return this.invalid("Invalid app key (only lowercase alpha, numbers, and - allowed)");
  }
});

Validator.factory(scope, "AcreVersion", {
  "string": function(key) {
    // 'current' is a reserved version name
    if (key == 'current') {
      return this.invalid('"current" is a reserved version name.');
    }

    // 'release' is a reserved version name
    if (key == 'release') {
      return this.invalid('"release" is a reserved version name.');
    }

    // XXX - check that it's non-null, uses valid characters
    if (!(/^[\-0-9a-z]{0,20}$/).test(key)) {
      return this.invalid(val, '- only lowercase alpha, numbers, and - are allowed in version names');
    }

    return key;
  }
});

Validator.factory(scope, "AcreFilename", {
  "string": function(name) {
    if (!/^[\-_0-9A-Za-z\.]+$/.test(name)) {
      return this.invalid("File names can only contain alphanumeric characters, ., - and _");
    }

    if (!/^[A-Za-z]/.test(name)) {
      return this.invalid("File names must be begin with a letter");
    }

    if (!/[0-9A-Za-z]$/.test(name)) {
      return this.invalid("File names cannot end with a special character");
    }

    var RESERVED_KEYS = {'acre':true, 'status':'', 'api':true};
    if (name in RESERVED_KEYS) {
      return this.invalid("'acre', 'api', and 'status' are reserved file names");
    }

    return name;
  }
});

Validator.factory(scope, "AcreResource", {
  "string": function(path, options) {

    function escape_re(s) {
      var specials = /[.*+?|()\[\]{}\\]/g;
      return s.replace(specials, '\\$&');
    }

    var DEFAULT_HOST_NS = "/freebase/apps/hosts";

    var APPEDITOR_SERVICE_PATH = "/appeditor/services/";

    var ACRE_TO_FREEBASE_MAP = {
      "freebaseapps.com"           : {
        service_url : "http://api.freebase.com",
        site_host   : "http://www.freebase.com"
      },
      "sandbox-freebaseapps.com"   : {
        service_url : "http://api.sandbox-freebase.com",
        site_host   : "http://www.sandbox-freebase.com"
      },
      "acre.z:8115"                : {
        service_url : "http://api.sandbox-freebase.com",
        site_host   : "http://devel.sandbox-freebase.com:8115"
      }
    };

    // setup environment URLs
    var hosts = [];
    for (var host in ACRE_TO_FREEBASE_MAP) {
      hosts.push(escape_re(host));
    }
    var acre_host_re = new RegExp("\.(" + hosts.join("|") +")\.$");
    var acre_host = acre.host.name + ((acre.host.port !== 80) ? ":" + acre.host.port : "");

    options = options || {};
    var app_ver_id_parts;   // arrary used to manipulate appid/host components

    // structure of object we'll be returning
    var resource = {
      path        : null,
      id          : null,
      app_path    : null,
      appid       : null,
      version     : null,
      filename    : null,
      path_info   : "/",
      querystring : null,
      service_url : acre.freebase.service_url,
      site_host   : acre.freebase.site_host,
      acre_host   : acre_host
    };
    resource.appeditor_service_base = resource.site_host + APPEDITOR_SERVICE_PATH;

    if (typeof path === 'undefined') return resource;
    if (typeof path !== 'string') {
      return this.invalid("Can't parse a path that is not a string.")
    }

    // extract querystring, if present
    var qparts = path.split("?");
    if (qparts.length > 1) {
      resource.querystring = qparts[1];
    }

    var base_path = qparts[0];

    var bits = base_path.split("//");

    // it's the new URL-style styntax:
    if (bits.length === 2) {
      // extract app host portion
      var parts = bits[1].split('/');
      var app_host_part = parts.shift();

      // extract filename and path_info, if present
      if (parts.length) {
        resource.filename = parts.join('/');
      }
      // Resolve whether source is x-graph.  If it is:
      // * change the service_url
      // * munge other values accordingly
      if (/^https?:$/.test(bits[0])) {
        // For URLs, do a HEAD request to find out from acre where the source really is (post-routing)
        var req = acre.urlfetch(path, {method : "HEAD"});
        var source_url = req.headers['x-acre-source-url'];
        if (!source_url) return resource;

        var ae_host = /^https?:\/\/([^\/]*)/.exec(source_url);
        if (ae_host) {
          for (var host in ACRE_TO_FREEBASE_MAP) {
            var freebase_urls = ACRE_TO_FREEBASE_MAP[host];
            // known appeditor host, reset URLs
            if (freebase_urls.site_host = ae_host[0]) {
              resource.acre_host = host;
              resource.service_url = freebase_urls.service_url;
              resource.site_host = freebase_urls.site_host;
            }
          }
        }
        var app_host_res = /\#\!path=\/\/([^\/]*)/.exec(source_url);
        if (app_host_res) app_host_part = app_host_res[1];
      } else {
        var match = app_host_part.match(acre_host_re);
        // check whether path given is absolute (ends in .) and is for a known host
        if(match) {
          // make the app host relative again
          app_host_part = app_host_part.replace(acre_host_re,"");
          // if it's x-graph, reset URLs
          if (acre_host !== match[1]) {
            // known appeditor host, reset service URLs
            var freebase_urls = ACRE_TO_FREEBASE_MAP[match[1]];
            resource.acre_host = match[1];
            resource.service_url = freebase_urls.service_url;
            resource.site_host = freebase_urls.site_host;
          }
        } else {
          // TODO : what if it's absolute but not for a known host?
        }
      }

      // break-down app host so we can work with it
      app_ver_id_parts = app_host_part.split('.');

      // construct fully-qualified versioned appid and app_host
      switch (app_ver_id_parts[app_ver_id_parts.length-1]) {

        case "dev" :   // ends in '.dev' so it's fully-qualified ID
          app_ver_id_parts.pop();
          app_ver_id_parts.reverse().unshift("");
          break;

        case "" :      // ends in '.' so it's a full-qualified hostname
          app_ver_id_parts.pop();
          app_ver_id_parts.reverse().unshift(DEFAULT_HOST_NS);
          break;

        default :     // otherwise, it's a 'published' hostname
          app_ver_id_parts = app_ver_id_parts.reverse();
          var host_base_parts = acre.host.name.split('.');
          for (var a in host_base_parts) {
            app_ver_id_parts.unshift(host_base_parts[a]);
          }
          app_ver_id_parts.unshift(DEFAULT_HOST_NS);
          break;

      }

      resource.app_path = "//" + app_host_part;
      resource.appid = app_ver_id_parts.join('/');

      // it's an old-style graph ID
    } else if (/^(freebase:)?\//.test(path)) {

      var parts = path.replace(/^freebase:/,"").split('/');
      if (options.file) {
        resource.filename = acre.freebase.mqlkey_unquote(parts.pop());
        // NOTE: this mode does not support path_info (ambiguous)
      }
      resource.appid = parts.join('/');
      resource.app_path = "//" + resource.appid.split("/").reverse().join(".") + "dev";


      // it's a relative path
    } else {
      resource.appid = acre.current_script.app.id;
      resource.version = acre.current_script.app.version;
      resource.app_path = (resource.version ? resource.version + "." : "" ) +
                          resource.appid.split("/").reverse().join(".") + "dev";

      // extract filename and path_info, if present
      var parts = base_path.split("/");
      if (parts.length) {
        resource.filename = parts.pop();
        resource.path_info = "/" + parts.join("/");
      }
    }

    resource.id = resource.appid + (resource.filename ? "/" + acre.freebase.mqlkey_quote(resource.filename) : "");
    resource.path = resource.app_path + (resource.filename ? "/" + resource.filename : "");
    resource.url = acre.host.protocol + ":" + resource.app_path + "." + acre.host.name +
                    (acre.host.port !== 80 ? (":" + acre.host.port) : "") +
                    (resource.filename ? "/" + resource.filename : "");

    return resource;
  }
})
