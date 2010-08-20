var mf = acre.require("MANIFEST").MF;
var h = mf.require("core", "helpers");

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
Invalid.factory = (function() {
  function F(args) {
    return Invalid.apply(this, args);
  }
  F.prototype = Invalid.prototype;
  return function() {
    return new F(arguments);
  };
})();


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
 * var validated = MyValidator(val, options).to_js();
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
function Validator(val, options) {
  return new Validator.Class(val, options);
};
Validator.Class = function(val, options) {
  this.init(val, options);
};
Validator.factory = function(scope, name, prototype) {
  scope[name] = function(val, options) {
    return new scope[name].Class(val, options);
  };
  scope[name].Class = function(val, options) {
    this.init(val, options);
  };
  h.extend(scope[name].Class.prototype, Validator.Class.prototype, prototype);
  return scope[name];
};

Validator.Class.prototype = {
  init: function(val, options) {
    this.val = val;
    this.options = h.extend({}, this.defaults, options);
  },
  defaults: {
    strip: true
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
        this.invalid("required", val);
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
      return this.invalid("not a guid", val);
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
    return this.invalid("not a mql id", val);
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
      return this.invalid(val);
    }
    return this.invalid("oneof option not an array");
  }
});
