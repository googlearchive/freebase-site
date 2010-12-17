
/** mjt, mjt.mf.js **/

/** header.js **/
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


(function () {

// jQuery-style api for leaving the global namespace undisturbed.
//  note json2.js is not so well behaved.
var _mjt = window.mjt;
var mjt = window.mjt = {};
mjt.noConflict = function () {
    window.mjt = _mjt;
    return mjt;
};

// old:
//if (typeof mjt == 'undefined')
// mjt = {};

mjt.NAME = 'mjt';
mjt.VERSION = '0.9.3';
mjt.LICENSE =
"========================================================================\n"+
"Copyright (c) 2007-2009, Metaweb Technologies, Inc.\n"+
"All rights reserved.\n"+
"\n"+
"Redistribution and use in source and binary forms, with or without\n"+
"modification, are permitted provided that the following conditions\n"+
"are met:\n"+
"    * Redistributions of source code must retain the above copyright\n"+
"      notice, this list of conditions and the following disclaimer.\n"+
"    * Redistributions in binary form must reproduce the above\n"+
"      copyright notice, this list of conditions and the following\n"+
"      disclaimer in the documentation and/or other materials provided\n"+
"      with the distribution.\n"+
"\n"+
"THIS SOFTWARE IS PROVIDED BY METAWEB TECHNOLOGIES ``AS IS'' AND ANY\n"+
"EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE\n"+
"IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR\n"+
"PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL METAWEB TECHNOLOGIES BE\n"+
"LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR\n"+
"CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF\n"+
"SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR\n"+
"BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,\n"+
"WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE\n"+
"OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN\n"+
"IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n"+
"========================================================================\n";

})();

/** json2.js **/
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

/*
    http://www.JSON.org/json2.js
    2009-06-18

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html

    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the object holding the key.

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

/*jslint evil: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/

// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON = JSON || {};

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return this.valueOf() ? this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

/** util.js **/
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


/**
 *
 *  mjt utility library:
 *
 *
 *
 *  functions not needed for mjt.task should be moved out.
 */

(function(mjt){

if (typeof mjt.services == 'undefined')
    mjt.services = {};

/**
 * this can be set using
 *  mjt.debug=1
 * in the url query to drastically increase verbosity.
 */
mjt.debug = 0;

/**
 * generate a unique id (within the history of this script)
 *  based on a prefix.
 */
var _next_unique_id = {};
mjt.uniqueid = function (prefix) {
    var id = _next_unique_id[prefix];
    if (typeof id !== 'number')
        id = 1;
    _next_unique_id[prefix] = id + 1;

    return prefix + '_' + id;
};

/**
 * debug logging utility
 *  the argument processing should be rationalized here,
 *  and it should become an internal function.
 */
var spew_to_page = function (msg, args) {
    var output = document.createElement('div');
    var tag;
    var text;

    tag = document.createElement('h3');
    tag.style.backgroundColor = '#fff0f0';
    tag.appendChild(document.createTextNode(msg));
    output.appendChild(tag);

    for (var ai = 0; ai < args.length; ai++) {
        var value = args[ai];

        if (value instanceof Array) {
            tag = document.createElement('div');
            tag.innerHTML = mjt.flatten_markup(value);
            output.appendChild(tag);
            continue;
        }

        tag = document.createElement('pre');

        if (typeof(value) == 'string') {
            text = value;
        } else {
            // try to format each arg as json if possible
            try {
                text = JSON.stringify(value);
            } catch (e) {
                text = '' + value;
            }
        }

        text = text.replace(/\r?\n/g, '\r\n');
        tag.appendChild(document.createTextNode(text));
        output.appendChild(tag);
    }

    var container = document.getElementById('mjt_debug_output');
    if (!container)
        container = document.getElementsByTagName('body')[0];
    if (container)
        container.appendChild(output);
};

// this needs to be refactored!

(function () {
    function format_args(args) {
        return Array.prototype.slice.apply(args).join(' ');
    }
    if (typeof console != 'object' || typeof console.log == 'undefined') {
        // XXX need an acre version
        if (typeof document != 'undefined') {
            // browser without console.log - IE?
            mjt.error    = function () { spew_to_page('error', arguments); return '';};
            mjt.warn     = function () { spew_to_page('warning', arguments);  return '';};
            mjt.log      = function () { return ''; };
            mjt.note     = function () { return ''; };
            mjt.openlog  = function () { return ''; };
            mjt.closelog = function () { return ''; };
            mjt.assert   = function () { return ''; };
        } else if (typeof Packages != 'undefined') {
            // rhino - liveconnect but no document object

            var os = java.lang.System.err;
            mjt.error    = function () { os.println('error: ' + format_args(arguments)); return '';};
            mjt.warn    = function () { os.println('error: ' + format_args(arguments)); return '';};
            mjt.log    = function () { os.println('log: ' + format_args(arguments)); return '';};
            mjt.note    = function () { os.println('note: ' + format_args(arguments)); return '';};
    
            mjt.openlog  = function () { return ''; };
            mjt.closelog = function () { return ''; };
            mjt.assert   = function () { return ''; };
        }
    
    } else if (typeof console.debug == 'function') {
        // console.debug: firefox with firebug, or other with firebug lite
    
        /**
         * report an error.  accepts any number and kind of arguments.
         *
         */
        mjt.error = function () {
            console.error.apply(console, arguments);
            return '';
        };
        /**
         * report a warning.  accepts any number and kind of arguments.
         *
         */
        mjt.warn = function () {
            console.warn.apply(console, arguments);
            return '';
        };
        /**
         * unconditionally log a message.
         * accepts any number and kind of arguments.
         *
         */
        mjt.log = function () {
            console.log.apply(console, arguments);
            return '';
        };
        /**
         * log an info message if mjt.debug enabled
         *
         */
        mjt.note = function () {
            if (mjt.debug)
                console.info.apply(console, arguments);
            return '';
        };

        if (typeof console.group != 'undefined') {
        /**
         * open a group in the logging output, if the
         *  logging implementation supports that.
         *
         */
        mjt.openlog = function () {
            if (mjt.debug)
                console.group.apply(console, arguments);
        };
        } else {
            mjt.openlog = mjt.log;
        }

        if (typeof console.groupEnd != 'undefined') {
        /**
         * close a group begun using mjt.openlog().
         *
         */
        mjt.closelog = function () {
            if (mjt.debug)
                console.groupEnd.apply(console, arguments);
            return '';
        };
        } else {
            mjt.closelog = function () {
                return '';
            };
        }
    
        mjt.assert = function (b) {
            // test here so that we can put a breakpoint inside
            if (!b) {
                console.error.apply(console, arguments);
                throw new Error('assertion failed');
            }
            return '';
        };
    
    } else {
        // console.log but no console.debug - safari perhaps
        // safari 2 has a botched console.log that crashes the process if you
        // pass it too many arguments, so be careful.
    
        mjt.error    = function () { console.log('error: ' + format_args(arguments)); return '';};
        mjt.warn    = function () { console.log('warning: ' + format_args(arguments)); return '';};
        mjt.log      = function () { return ''; };
        mjt.note     = function () { return ''; };
        mjt.openlog  = function () { return ''; };
        mjt.closelog = function () { return ''; };
        mjt.assert   = function () { return ''; };
    }
})();

/**
 *
 * The list of characters that are ok in URIs.
 * this set is ok in query arguments and fragment contexts.
 * It is also ok for an url subpath (but not as a single path segment,
 * because '/' is considered ok).
 *
 * mjt takes pains to generate good-looking urls, so
 * it uses a different uri-encoder than the usual encodeURIComponent.
 */
var _uri_ok_chars = {
        '~': true,  '!': true,  '*': true,  '(': true,  ')': true,
        '-': true,  '_': true,  '.': true,  ',': true,
        ':': true,  '@': true,  '$': true,
        "'": true,  '/': true
};

/**
 * this is like encodeURIComponent() but quotes fewer characters.
 * encodeURIComponent passes   ~!*()-_.'
 * mjt.formquote also passes   ,:@$/
 */
mjt.formquote = function(x) {
    if (/^[-A-Za-z0-9~!*()_.',:@$\/]*$/.test(x))
        return x;

    return encodeURIComponent(x)
        .replace('%2C', ',', 'g')
        .replace('%3A', ':', 'g')
        .replace('%40', '@', 'g')
        .replace('%24', '$', 'g')
        .replace('%2F', '/', 'g');
};

/**
 * generate a www-form-urlencoded string from a dictionary
 *  undefined values are skipped, but empty-string is included.
 */
mjt.formencode = function(values) {
    var qtext = [];
    var sep = '';
    var k, v, ki, ks = [];

    // keys are sorted for cache-friendliness
    for (k in values)
        ks.push(k);
    ks.sort();

    for (ki in ks) {
        k = ks[ki];
        v = values[k];
        if (typeof v == 'undefined') continue;
        if (!(v instanceof Array))
            v = [v];

        for (var a=0; a < v.length; a++) {
            var lv = v[a];
            qtext.push(sep);
            sep = '&';
            qtext.push(mjt.formquote(k));
            qtext.push('=');
            qtext.push(mjt.formquote(lv));
        }
    }
    return qtext.join('');
};

/**
 * parse a www-form-urlencoded string into a dict
 */
mjt.formdecode = function (qstr) {
    if (typeof qstr == 'undefined' || qstr === null)
        return {};

    // trim leading and trailing whitespace.  this is most important
    // for POST bodies, where many http clients append
    // a newline to the urlencoded query.
    qstr = qstr.replace(/^\s*/m, '').replace(/\s+$/m, '');

    if (qstr == '')
        return {};

    var qdict = {};
    var qpairs = qstr.split('&');
    for (var i = 0; i < qpairs.length; i++) {
        var splitpt = qpairs[i].indexOf('=');

        if (splitpt < 1) {
            mjt.log('bad uri query argument, missing "=": ', qpairs[i]);
            continue;
        }

        var m = [qpairs[i].substring(0, splitpt), qpairs[i].substring(splitpt+1)];

        // decodeURIComponent doesnt handle +
        var k = decodeURIComponent(m[0].replace(/\+/g,' '));
        var v = decodeURIComponent(m[1].replace(/\+/g,' '));
        if (k in qdict) {
            if (qdict[k] instanceof Array)
                qdict[k].push(v);
            else
                qdict[k] = [qdict[k], v];
        } else {
            qdict[k] = v;
        }
    }
    return qdict;
};

/**
 * create a GET url from a base url and form values
 */
mjt.form_url = function(base, values) {
    var q = values && mjt.formencode(values);
    if (!q)
        return base;
    return base + '?' + mjt.formencode(values);
};

//////////////////////////////////////////////////////////////////////

/**
 *
 * escape <>&" characters with html entities.
 *
 *  escaping " is only necessary in attributes but
 *   we do it in all text.
 *
 */
mjt.htmlencode = function (s) {
    if (typeof(s) != 'string')
        s = '' + s;
    return s.replace(/\&/g,'&amp;')
        .replace(/\</g,'&lt;')
        .replace(/\>/g,'&gt;')
        .replace(/\"/g,'&quot;');
};


/**
 *  set up names for packages and constructors and such.
 *
 *    doesn't work very well yet but better than not seeing
 *    the names at all.
 */
mjt.label_package = function (dotpath) {
    var o = window;
    if (dotpath) {
        var path = dotpath.split('.');
        while (path.length) {
            o = o[path.shift()];
        }

        // if this is a constructor, label its methods
        if (typeof o == 'function')
            o = o.prototype;
    
        if ( (typeof o == 'object' || typeof o =='function') && o !== null)
            o._package_name = dotpath;
        else
            mjt.log('missing package', dotpath);
    }    

    // this is a clone of jQuery.isFunction()
    var isFunction = function (fn)  {
        // This may seem like some crazy code, but trust me when I say that this
        // is the only cross-browser way to do this. --John
        return !!fn && typeof fn != "string" && !fn.nodeName &&
        fn.constructor != Array && /function/i.test( fn + "" );
    };


    // XXX really shouldn't special-case mjt.Task, even in this cautious way.
    for (var k in o) {
        var defn = o[k];
        if (mjt && mjt.Task
            && isFunction(defn)
            && typeof defn.prototype == 'object'
            && defn.prototype instanceof mjt.Task) {
            defn.prototype._task_class = dotpath + '.' + k;
        }
    }
};

})(mjt);


/** task.js **/
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


/**
 *  asynchronous task framework
 *
 *  a task works like a callback but with more goodies.
 *  tasks provide:
 *   - a simple state machine: 'init' -> 'wait' -> ( 'ready' or 'error' )
 *   - separate .onready(...) and .onerror(...) callbacks.
 *     callbacks can be specified as functions or as bound methods
 *     using the syntax of mjt.vthunk().
 *   - optional timeout
 *   - optional prerequisites (other tasks that must be ready)
 *   - chaining of the above functions (inspired by jQuery)
 *
 *  uses:
 *    util.js
 *
 */

(function(mjt){

// unique value to signal ok constructor usage.
// this is used to detect if a user tries to create a Task using "new".
var _safe_constructor_token = ['safe_constructor_token'];

/**
 *  this is a clone of jQuery.isFunction()
 */
var isFunction = function (fn)  {
    // This may seem like some crazy code, but trust me when I say that this
    // is the only cross-browser way to do this. --John
    return !!fn && typeof fn != "string" && !fn.nodeName &&
    fn.constructor != Array && /function/i.test( fn + "" );
};

/**
 *  this is a clone of jQuery.makeArray()
 */
var makeArray = function( a ) {
    var r = [];

    // Need to use typeof to fight Safari childNodes crashes
    if ( typeof a != "array" )
	for ( var i = 0, al = a.length; i < al; i++ )
	    r.push( a[i] );
    else
	r = a.slice( 0 );

    return r;
};



/**
 *  create a callback or continuation function that
 *   acts like a "bound method".
 *
 *  @param method  the name of the method to be invoked in obj,
 *                 or a function to be called as a method
 *                 or <i>null</i> if obj should be called as a function.
 *  @param obj     the instance whose method should be invoked,
 *                 or a function to be invoked.
 *  @param ...     additional arguments are also bound.
 *  @returns       a "thunk" function (or "bound method") that
 *                 will call obj[method] with the bound arguments,
 *                 followed by whatever additional arguments
 *                 were passed to the thunk.
 *
 *  the object, method key, and any other arguments
 *   are bound when mjt.thunk(method, obj, ...) is
 *   invoked.
 *
 */
mjt.thunk = function (method, obj) {
    return mjt.vthunk(arguments);
};


/**
 *  create a thunk.
 *
 *  utility for function currying.
 *    similar to .partial()
 *
 *  this is used to implement on* handlers that
 *   thunk or curry their arguments.  rather than
 *   accepting a single callback function argument,
 *   you can accept a bound method with a partial
 *   argument list.
 *
 *  @returns a thunk object in most cases, unless the
 *  argument is a single callback function in which
 *  case it is returned untouched.
 *
 *  a thunk is a function object with the following
 *  additional properties:
 *   thunk.bound_this
 *   thunk.bound_func
 *   thunk.bound_args
 *   thunk.thunk_id
 *
 *  vthunk has several call forms:
 *
 *    vthunk(arguments) or
 *    vthunk([arg0, ...]))
 *      if the first argument is an array, vthunk treats it
 *        as the argument list and then tries one of the
 *        forms below:
 *
 *    vthunk(bound_method_name, bound_this, bound_arg_0, ...)
 *      if the first argument is a string, vthunk treats it
 *        as a method name.  the second argument must be an
 *        object, which will be bound as this.
 *
 *      when thunk(call_arg_0, ...) is executed, this will happen:
 *        bound_this[bound_method_name](bound_arg_0, ..., call_arg_0, ...)
 *
 *    vthunk(bound_function, bound_arg_0, ...)
 *      otherwise the first argument must be a function.
 *      bound_this will be set to null.
 *
 *      when thunk(call_arg_0, ...) is executed, this will happen:
 *        bound_function(bound_arg_0, ..., call_arg_0, ...)
 *      (except this===null inside bound_function, rather than this===window)
 *
 *    vthunk(bound_function)
 *      in this case the thunk doesn't actually do much
 *      except slow down calls, so we return bound_function
 *      as the thunk itself.
 *      no annotation of the function object is done since
 *      it may be shared.
 *      because we're getting out of the way, bound_function
 *      will be called with this===window.
 *
 */
mjt.vthunk = function () {
    var bound_this, bound_func, bound_args;

    var arg0 = arguments[0];
    if (typeof arg0 == 'object' && typeof arg0.length == 'number') {
        bound_args = makeArray(arg0);
    } else {
        bound_args = makeArray(arguments);
    }

    arg0 = bound_args.shift();
    if (typeof arg0 == 'string') {
        bound_this = bound_args.shift();
        bound_func = arg0;

        // it's technically ok if bound_this[bound_func] doesn't exist yet,
        //  but probably an error
        if (!isFunction(bound_this[bound_func])) {
            mjt.warn('mjt.thunk:', bound_func, 'is not a method of', bound_this);
        }
    } else {
        // pass "this" through when the thunk is called
        bound_this = null;
        bound_func = arg0;

        // bound_func really should be a function
        if (!isFunction(bound_func)) {
            mjt.error('mjt.thunk:', bound_func, 'is not a function');
        }
    }

    // these are for debugging recognition only
    var thunk_id = arguments.callee._next_thunk_id || 1;
    arguments.callee._next_thunk_id = thunk_id + 1;

    var thunk = function() {
        //mjt.log('CALL THUNK', thunk_id, obj, method);

        var self = arguments.callee;
        var call_args = self.bound_args.concat(makeArray(arguments));
        var obj = self.bound_this===null ? this : self.bound_this;
        var func = self.bound_func;
        if (typeof func == 'string')
            func = obj[func];

        if (!isFunction(func)) {
            mjt.error('mjt.thunk: bad function', self, self.bound_func, obj);
        }

        return func.apply(obj, call_args);
    };

    // a thunk is a javascript Function, for speed and
    //   for most common usage.
    // but it's nice to treat it like an object in some ways.
    // so instead of just capturing the environment we explicitly
    // save the bits we need.
    thunk.bound_this = bound_this;
    thunk.bound_func = bound_func;
    thunk.bound_args = bound_args;
    thunk.thunk_id = thunk_id;

    //mjt.log('NEW THUNK', thunk_id, thunk);

    return thunk;
}

/**
 *  call a thunk spec immediately, using the same signature
 *   as mjt.vthunk.  useful when you are ready to build
 *   a thunk but can call it immediately instead for
 *   speed.
 *
 *  @param this       this is passed through to the thunk
 *  @param thunkspec  an array describing the thunk
 *  @param ...        extra args are appended to the thunk call
 *  @returns          the result of calling the thunk
 *
 *  @see mjt.vthunk
 */

mjt.vcall = function (thunkspec) {
    // slow for now
    var call_args = makeArray(arguments).slice(1);
    return mjt.vthunk(thunkspec).apply(this, call_args);
};

/**
 *  call a thunk spec immediately.
 *   useful when you are ready to build
 *   a thunk but can call it immediately instead for
 *   speed.
 *
 *  @param this       this is passed through to the thunk
 *  @param thunkspec  an array describing the thunk
 *  @param call_args  an array of extra arguments
 *  @returns          the result of calling the thunk
 *
 *  @see mjt.vthunk
 */
mjt.vapply = function (thunkspec, call_args) {
    // slow for now
    return mjt.vthunk(thunkspec).apply(this, call_args);
};



/**
 *  @class a class representing an asynchronous task
 *
 *  the state machine cycle of a task is
 *    init --> wait --> ( ready | error )
 *
 *  you can request a callback for either or both of
 *    the two final states.  if the callback is another
 *    instance of mjt.Task, it will use a special interface?
 *
 *  @see mjt.Task.onready
 *  @see mjt.Task.onerror
 *  @see mjt.Task.ondone
 *
 *  @constructor this constructor should never be called explicitly.
 *
 */
mjt.Task = function () {
    // nothing should be done in here - this used as a base class
    // use mjt.Task.prototype.init for initializing instance vars

    if (arguments.length !== 1 ||
        arguments[0] !== _safe_constructor_token) {
            mjt.error('new mjt.Task() is illegal');
            throw new Error("don't call mjt.Task()");
   }
};

/**
 *  string pretty-printer
 */
mjt.Task.prototype.toString = function() {
    return '[' + this._task_id + ']';
};

/**
 *  html pretty-printer
 */
mjt.Task.prototype.toMarkup = function () {
    return '<span class="mjt_task">task '
        + this._task_id + ':' + this.state + '</span>';
};


// provide Object.getPrototypeOf implementation according to 
//  http://ejohn.org/blog/objectgetprototypeof/
if ( typeof Object.getPrototypeOf !== "function" ) {
    if ( typeof "test".__proto__ === "object" ) {
        Object.getPrototypeOf = function(object){
            return object.__proto__;
        };
    } else {
        Object.getPrototypeOf = function(object){
            // May break if the constructor has been tampered with
            return object.constructor.prototype;
        };
    }
}

/**
 *  Return a new task factory function.
 *
 *  @param sooper a superclass task type, or undefined/null/false
 *  @param params a list of parameter declarations.
 *  @returns a Task type - this should be called without "new"
 *
 *  @see mjt.Task.prototype.init
 */
mjt.define_task = function(sooper, params) {
    var task_ctor = function () {
        var obj;
        var args = makeArray(arguments);

        // called with new: check that this was was done
        // by the system (passing a secret token) rather than
        // by the user.
        if (this instanceof arguments.callee) {
            if (args.length !== 1 ||
                args[0] !== _safe_constructor_token) {
                throw new Error('Task class should not be invoked with new ()');
            } else {
                // called internally: do nothing
                return undefined;
            }
        } else {
            // called without new
            // recursively invoke ourselves as a constructor
            //  to set obj.__proto__=ctor.
            // we deliberately use "new" here to skip any
            //  instance initialization.
            // when we are reinvoked we will hit the
            // "called internally: do nothing" case above.
            obj = new arguments.callee(_safe_constructor_token);

            // XXX the _factory points to the namespace where the constructor
            // was found, e.g "mjt.freebase".  mostly this is no longer needed,
            // since the service_url is stored in a global now rather than
            // in the mjt.freebase object.  there are a few remaining references
            // to task._factory that need to be removed before this can go away.
            // note that there is also TemplateCall._factory which is more important.
            obj._factory = this;

            //mjt.log('FUNCALL', arguments.callee);
        }

        // invoke the task constructors (the .init() methods) from base to leaf.
        //  this means reversing the inheritance chain first.

        var tmpa = [];
        for (var tmp = arguments.callee;
             tmp !== undefined;
             tmp = tmp.__super) {
            tmpa.push(tmp);
        }
        while (tmpa.length) {
            var ctor = tmpa.pop();
            if (ctor.prototype.hasOwnProperty('init'))
                ctor.prototype.init.apply(obj, args);
        }

        // for backwards compatibility, some acre tasks call .enqueue()
        // automatically when a task is constructed.  this switch enables
        // that behavior.
        if (typeof arguments.callee._auto_enqueue != 'undefined') {
            // enqueue immediately
            obj.enqueue();
        }

        return obj;
    };

    // set up a superclass
    if (!sooper)
        sooper = mjt.Task;

    // the subclass prototype is an instance of the superclass
    task_ctor.prototype = new sooper(_safe_constructor_token);
    task_ctor.prototype.constructor = task_ctor;

    // IE doesn't let you get access to the prototype chain,
    // so we need to explicitly link the subclass with the superclass.
    task_ctor.__super = sooper;
    
    task_ctor.prototype.parameters = params || [];
    return task_ctor;
};



/**
 *  the default timeout for set_timeout, in milliseconds.
 *  this is currently set to 10 seconds.
 *  the value has not been tuned for general use.
 *  the freebase.com service will usually time out a
 *   request after 8 seconds so longer than that.
 *
 *  @type int (milliseconds)
 *  @see mjt.Task.set_timeout
 */
mjt.Task._default_timeout = 10000;

/**
 *  a dict of tasks that are in wait state.
 *
 */
mjt.Task.pending = null;

// waiting callbacks
mjt.Task._on_pending_empty = [];

/**
 *  add a task to the pending list
 *
 */
mjt.Task.add_pending = function (task) {
    if (this.pending == null)
        this.pending = {};
    this.pending[task._task_id] = task;
};

/**
 *  remove a task from the pending list, and notify
 *  if the pending list is empty.
 *
 */
mjt.Task.delete_pending = function (task) {
    if (this.pending === null || !(task._task_id in this.pending))
        return;
    delete this.pending[task._task_id];

    for (var pk in this.pending)
        return;

    this.pending = null;

    while (this.pending == null && this._on_pending_empty.length)
        this._on_pending_empty.shift().ready();
};

/**
 *  set up instance variables from this.parameters and arguments
 *
 *  @param ... arguments are interpreted according to this.parameters
 *  @returns this
 *  this[param.name] is set for each argument
 *
 *  right now parameters only have .name but later
 *  they may have defaults and docstrings.
 *
 */
mjt.Task.prototype.init = function() {
    //mjt.log('TASK INIT', this.parameters, arguments);
    mjt.assert(typeof this.state === 'undefined');
    this.state = 'init';

    this._onready = [];
    this._onerror = [];
    this._timeout = null;
    this._prereqs = {};

    this._task_id = mjt.uniqueid(this._task_class ? this._task_class : 'task');

    mjt.Task.add_pending(this);

    for (var i = 0; i < this.parameters.length; i++) {
        var param = this.parameters[i];
        this[param.name] = typeof arguments[i] != 'undefined'
            ? arguments[i] : param['default'];
    }

    return this;
};


/**
 *  set a failure timeout on a task
 *
 */
mjt.Task.prototype.set_timeout = function (msec) {
    if (typeof msec === 'undefined')
        msec = mjt.Task._default_timeout;

    if (this._timeout !== null)
        mjt.error('timeout already set');

    // rhino never times out
    if (typeof setTimeout != 'undefined')
        this._timeout = setTimeout(mjt.thunk('timeout', this), msec);

    return this;
};

mjt.Task.prototype.clear_timeout = function () {
    // clear any timeout if present
    if (this._timeout !== null)
        clearTimeout(this._timeout);
    this._timeout = null;

    return this;
};



/**
 *  add a task dependency.
 *
 * if you only depend on one task, it's probably simpler
 *  to just use onready and onerror on that task.  if you
 *  have to wait for multiple tasks to succeed before
 *  finishing, use this.
 *
 * @see mjt.Task.enqueue
 * @see mjt.Task.request
 *
 * when .enqueue() is called on the parent task, it will
 * be called on all subtasks.
 * if any prereq tasks go into error state, so does this.
 * when *all* required tasks are ready, this.request() is called.
 * otherwise, wait.
 *
 * @parm task  the task depended upon
 */
mjt.Task.prototype.require = function (prereq) {
    // if we are already ready, adding prereqs is illegal
    if (this.state !== 'init')
        throw new Error('task.enqueue() already called - too late for .require()');

    // avoid dependency bookkeeping if prereq is already ready
    if (prereq.state == 'ready')
        return this;

    // if we are already in error state, we're not going anywhere.
    if (this.state == 'error')
        return this;

    // ok, we're in wait state

    // pass on any immediate errors
    if (prereq.state == 'error')
        return this._prereq_error(prereq);

    // ok, we're both in wait state.  set up the dependency.
    this._prereqs[prereq._task_id] = prereq;
    
    prereq
        .onready('_prereq_ready', this, prereq)
        .onerror('_prereq_error', this, prereq);

    return this;
};

/**
 *  declare that no more prereqs are needed.
 *
 *  you *must* call this if you have called .require(),
 *   or the ready state will never be reached.
 * 
 * in server-side (synchronous) operation you don't need to call .enqueue().
 *
 * @parm task  the task depended upon
 *
 * @see mjt.Task.require
 */
mjt.Task.prototype.enqueue = function () {
    // don't warn about redundant enqueues, they happen too often
    if (this.state != 'init')
        return this;

    this.state = 'wait';

    if (mjt.Task.debug) {
        mjt.openlog(this, '.enqueue()');
    }    
    
    try {
        for (var k in this._prereqs)
            this._prereqs[k].enqueue();
    
        return this._prereqs_check();
    } finally {
        mjt.closelog();
    }
};

mjt.Task.prototype._prereqs_check = function () {
    // _prereqs is initialized as an empty array.
    // it may be set to null here to indicate that 
    // all prereqs have succeeded.
    
    // if prereqs have been cleaned out, we already did this
    if (this._prereqs === null)
        return this;

    // if there are any remaining prereqs, bail
    for (var prereq in this._prereqs)
        return this;

    if (this.state == 'init')
        return this;

    // looks like all prereqs are ready
    //  (since error prereqs cause errors immediately)
    this._prereqs = null;
    this.request();
    return this;
};


/**
 *  called when all prerequisites are ready
 *
 *  "subclasses" may override this method to
 *  do anything once prerequisites are ready.
 *
 *  many of the properties and methods here are
 *  marked hidden with _ prefixing to avoid namespace
 *  conflicts.  subclasses should avoid the _ prefix.
 *
 */
mjt.Task.prototype.request = function() {
    // should be overridden
    return this.ready();
};



// callback when a prerequisite task succeeds
mjt.Task.prototype._prereq_ready = function (prereq) {
    if (this._prereqs === null)
        return this;
    delete this._prereqs[prereq._task_id];
    return this._prereqs_check();
};

// callback when a prerequisite task fails
mjt.Task.prototype._prereq_error = function (prereq) {
    if (this._prereqs === null)
        return this;

    // errors get passed through immediately
    this._prereqs = null;
    var msg = prereq.messages[0];
    return this.error(msg.code, msg.message, msg.text);
};


/**
 *  request a callback if the task reaches 'ready' state
 *
 */
mjt.Task.prototype.onready = function (THUNK_ARGS) {
    if (this.state == 'ready') {
        mjt.vcall(arguments, this.result);
    } else if (this._onready instanceof Array) {
        this._onready.push(mjt.vthunk(arguments));
    }
    return this;
};

/**
 *  request a callback if the task reaches 'error' state
 *
 */
mjt.Task.prototype.onerror = function (THUNK_ARGS) {
    if (this.state == 'error') {
        var code = this.messages[0].code;
        var message = this.messages[0].message;
        var full = this.messages[0].text;

        mjt.vcall(arguments, code, message, full);
    } else if (this._onerror instanceof Array) {
        this._onerror.push(mjt.vthunk(arguments));
    }
    return this;
};

/**
 *  request a callback if the task reaches
 *   either 'ready or 'error' state.
 *
 */
mjt.Task.prototype.ondone = function (THUNK_ARGS) {
    this.onready.apply(this, arguments);
    this.onerror.apply(this, arguments);
    return this;
};

// internal, common to ready() and error()
mjt.Task.prototype._state_notify = function (state, callbacks, args) {

    // mjt.Task.debug is set by mjt.App.init()
    if (!mjt.Task.debug) {
        // fastpath if debug is turned off
        for (var i = 0; i < callbacks.length; i++) {
            var cb = callbacks[i];
            cb.apply(this, args);
        }
        return this;
    }

    for (var i = 0; i < callbacks.length; i++) {
        var cb = callbacks[i];

        if (typeof cb.bound_func !== 'undefined')
            mjt.openlog(this, '.on'+state, ' -> '+cb.bound_this+'.', cb.bound_func, cb.bound_args, cb);
        else
            mjt.openlog(this, '.on'+state, cb);

        try {
            cb.apply(this, args);
        } finally {
            mjt.closelog();
        }
    }

    return this;
};


/**
 *   put the task in ready state, saving the result arg
 *
 */
mjt.Task.prototype.ready = function (result) {
    if (this._prereqs !== null) {
        for (var k in this._prereqs) {
            if (typeof this._prereqs[k] == 'undefined')
                continue;

            mjt.error('task.ready() called with remaining prereqs', this);
            throw new Error('task.ready() called with remaining prereqs');
            break;
        }
    }

    // skipping .enqueue() is allowed if you have no prereqs
    if (this.state == 'init') {
        this._prereqs = null;
        this.state = 'wait';
    }

    if (this.state !== 'wait') {
        throw new Error('task.ready() called in bad state "'+this.state+'", should be "wait"');
    }

    this._onerror = null;
    this.clear_timeout();
    this.state = 'ready';

    var callbacks = this._onready;
    this._onready = null;

    this.result = result;

    mjt.Task.delete_pending(this);

    this._state_notify('ready', callbacks, [result]);

    return this;
};

// internal
mjt.Task.prototype._error = function (messages, error_chain) {
    this._prereqs = null;
    this._onready = null;
    this.clear_timeout();

    var callbacks = this._onerror;
    this._onerror = null;

    //mjt.warn('task error', ''+this, messages);

    // skipping .enqueue() is allowed if you have no prereqs
    if (this.state == 'init') {
        this._prereqs = null;
        this.state = 'wait';
    }
    if (this.state !== 'wait') {
        throw new Error('task.error() called in bad state "'+this.state+'". Error was '+messages[0].message);
    }

    this.state = 'error';

    this.messages = messages;

    // nothing is done with this yet
    //  we only report the first error that caused a failure.
    this._error_chain = error_chain;

    var task_info = this;
    //WILL: TODO: we can find the query that caused the problem by looking at this.url
    // But how can we point the user back to the original task (e.g. MqlRead), the query and the line number were it was called?
    // If the user forgets to add an onerror() handler then this info is really useful.
    
    var args = [messages[0].code, messages[0].message, messages[0].text, task_info]; 

    mjt.Task.delete_pending(this);

    this._state_notify('error', callbacks, args);

    return this;
};


/**
 *   put the task in error state, saving the error args
 *
 */
mjt.Task.prototype.error = function (code, message, full) {
    var messages = [{
        code: code,
        message: message,
        text: (typeof full !== 'undefined') ? full : ''
    }];
    return this._error(messages);
};

/**
 *   put the task in error state, passing the error
 *   through from another failed task.
 *
 */
mjt.Task.prototype.error_nest = function (failed_task) {
    return this._error(failed_task.messages, failed_task);
};



/**
 *   re-entry point if the task has a timeout set.
 *
 */
mjt.Task.prototype.timeout = function () {
    // the timeout has fired - erase the token so
    //  we don't try to cancel it later.
    this._timeout = null;

    return this.error('/user/mjt/messages/task_timeout',
                      'task timed out - possible unreachable server?');
};


/**
 *  this task always succeeds immediately.
 * 
 *  useful as a way to group prereqs, for example.
 */
mjt.Succeed = mjt.define_task(null, [{ name: 'succeed_result', 'default':null }]);

mjt.Succeed.prototype.request = function() {
  return this.ready(this.succeed_result);
};

/**
 *  this task always fails immediately.
 */
mjt.Fail = mjt.define_task(null, [{ name: 'fail_code',    'default': 'mjt_fail' },
                                  { name: 'fail_message', 'default': 'error signaled using mjt.Fail' },
                                  { name: 'fail_full',    'default':'' }]);
                                  
mjt.Fail.prototype.request = function () {
    return this.error(this.fail_code, this.fail_message, this.fail_full);
};


/**
 *  delay for a number of milliseconds, then go 'ready'
 */
mjt.Delay = mjt.define_task(null, [{name: 'delay'}]);

mjt.Delay.prototype.request = function () {
    var task = this;
    setTimeout(function () {
        task.ready(null)
    }, this.delay);
};


/**
 *  return a new mjt.Task that will succeed when
 *   the list of pending tasks becomes empty.
 *  this can be used to detect when a page is
 *   quiescent, though it won't catch i/o
 *   requests that weren't done through mjt.Task.
 *
 */
mjt.NoPendingTasks = mjt.define_task();

mjt.NoPendingTasks.prototype.init = function () {
    // otherwise add ourselves as a callback
    mjt.Task._on_pending_empty.push(this);

    // so the existence of this task doesn't create a problem
    // this will also fire 'this' immediately since we already
    // added ourselves to _on_pending_empty.
    mjt.Task.delete_pending(this);
};

mjt.NoPendingTasks.prototype.request = function () {
};

 
})(mjt);

/** pager.js **/
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

(function(mjt){


/**
 *  returns a task that is ready when complete
 */
mjt.PagerSlice = mjt.define_task(null,
                [{name: 'pager'},
                 {name: 'start'},
                 {name: 'count'}]);

mjt.PagerSlice.prototype.init = function () {
    this.chunks = this.pager.slice_chunks(this.start, this.count);

    var chunks = this.chunks;
    for (var i = 0; i < chunks.length; i++)
        this.require(chunks[i]);

    return this.enqueue();
};


mjt.PagerSlice.prototype.request = function () {
    // all chunks ready
    var chunks = this.chunks;

    var results = [];
    var end = this.start + this.count;
    for (var i = 0; i < chunks.length; i++) {
        var chunk = chunks[i];
        var starti = this.start - chunk.start;
        if (starti < 0) continue;
            var count = starti + this.count;
        if (starti + count > chunk.count)
            count = chunk.count - starti;
        if (count <= 0) continue;

        if (starti == 0 && count == chunk.count)
            results = results.concat(chunk.result);
        else
            results = results.concat(chunk.result.slice(starti, count));
    }
    return this.ready(results);
};


/**
 *  returns a task with .results set to the slice
 */
mjt.Pager = function (first_chunk) {
    //this.task_class = task_class;
    //this.task_params = task_params;

    // chunks are tasks, sorted by .start
    this.chunks = [];
    this.chunks_waiting = 0;

    this.add_chunk(first_chunk);
};

/**
 *  create a new chunk task
 */
mjt.Pager.prototype._next_chunk = function(count) {
    var last_chunk = this.chunks[this.chunks.length - 1];

    var task = last_chunk.next(count);
    this.add_chunk(task);
    return task;
};

mjt.Pager.prototype.add_chunk = function(task) {
    task.enqueue();
    this.chunks_waiting++;
    task.onready('chunk_ready', this)
        .onerror('chunk_error', this);

    this.chunks.push(task);
    return this;
};

mjt.Pager.prototype.chunk_ready = function() {
    this.chunks_waiting--;
};

mjt.Pager.prototype.chunk_error = function() {
    this.chunks_waiting--;
};

/**
 *  returns an array of chunks that contain some
 *  necessary data for a slice.
 *  creates a new chunk for any remaining data that
 *  hasn't been fetched yet
 *
 *  XXX bug if there is already a pending read,
 *   we can't start the next one since we don't
 *   have a cursor.  need to queue up...
 */
mjt.Pager.prototype.slice_chunks = function(start, count) {
    var slice = [];
    var end = start + count;

    //mjt.log('SLICING', this, start, count);

    var chunks = this.chunks;
    var nexti = 0;
    for (var ci = 0; ci < chunks.length; ci++) {
        var chunk = this.chunks[ci];
        if (chunk.start >= end) continue;
        if (chunk.start + chunk.end <= start) continue;
        slice.push(chunk);
        nexti = chunk.start + chunk.count;
    }
    if (end > nexti) {
        slice.push(this._next_chunk(end - nexti));
    }
    return slice;
};

/**
 *  returns a task for an arbitrary results slice
 */
mjt.Pager.prototype.slicetask = function(start, count) {
    return mjt.PagerSlice(this, start, count);
};


/**
 *  calls the appropriate callback when a slice is ready/done
 */
mjt.Pager.prototype.slice = function(start, count, onready, onerror) {
    this.slicetask(start, count)
        .onready(onready).onerror(onerror);
};
})(mjt);

/** browserio.js **/
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



//
// this contains browser-specific javascript i/o routines
//
// it provides an implementation of mjt.io as well as a
// few helper routines for direct use if you're coding
// to a browser.
//

(function(mjt){

/**
 * create a dynamic script tag and append it to HEAD
 *
 * @param [tag_id] string  an id= for the SCRIPT tag
 * @param [url]    uri     the src= url
 * @param [text]   string  literal javascript text
 * @returns    domelement  the new SCRIPT node
 *
 */
mjt.dynamic_script = function (tag_id, url, text) {
    var head = document.getElementsByTagName('head')[0];
    var tag = document.createElement('script');
    tag.type = 'text/javascript';
    if (typeof tag_id == 'string')
        tag.id = tag_id;
    if (typeof url !== 'undefined')
        tag.src = url;
    if (typeof text !== 'undefined') {
        // see http://tobielangel.com/2007/2/23/to-eval-or-not-to-eval
        if(/WebKit|Khtml/i.test(navigator.userAgent))
            throw new Error('safari doesnt evaluate dynamic script text');
        tag.text = text;
    }

    head.appendChild(tag);
    return tag;
};


/**
 *  create an IFRAME that loads a particular uri.
 *
 *  @param id  string  the HTML id= attribute for the new IFRAME.
 *  @param url uri     the uri to fetch.
 *  @returns   element the IFRAME dom element
 */
mjt.dynamic_iframe = function (id, url) {
    var iframe = document.createElement('iframe');
    if (typeof id == 'string')
        iframe.id = id;
    iframe.style.display = 'none';
    // the class="mjt_dynamic" tells the compiler to skip it,
    // a useful hack.
    iframe.className = 'mjt_dynamic';
    iframe.setAttribute('src', url);
    //mjt.log('created iframe src=', url, iframe.id);
    return iframe;
};




/**
 * evaluate javascript code from a url, providing a Task
 * object so you can detect errors as well as success.
 *
 * @param url url to fetch the javascript from.
 *
 */
mjt.AsyncScript = mjt.define_task(null,
                                  [{name: 'url'}]);

mjt.AsyncScript.prototype.request = function () {
    var task = this;
    var js = mjt.dynamic_script(null, this.url);

    //
    // hopefully browser-independent code to generate a
    // dynamic <script> tag with completion callback.
    // this is needed when we don't get to send a callback= parameter.
    // i don't think this method reports http errors though.
    //
    // original from:
    //   <a href="http://www.phpied.com/javascript-include-ready-onload/">phpied.com</a>
    // safari iframe hack from:
    //   <a href="http://pnomolos.com/article/5/dynamic-include-of-javascript-in-safari">pnomolos.com</a>
    //
    // nix added completion function and hopeful safari future-proofing
    //

    // Safari doesn't fire onload= on script tags.  This hack
    // loads the script into an iframe too, and assumes that the
    // <script> will finish before the onload= fires on the iframe.
    if(/WebKit|Khtml/i.test(navigator.userAgent)) {
        var iframe = mjt.dynamic_iframe();
        // Fires in Safari
        iframe.onload = function () {
            task.ready(null);
        };
        document.getElementsByTagName('body')[0].appendChild(iframe);
    } else {
        // Fires in IE, also modified the test to cover both states
        js.onreadystatechange = function () {
            if (/complete|loaded/.test(js.readyState))
                task.ready(null);
        };
        // Fires in FF
        // (apparently recent versions of webkit may fire this too - nix)
        js.onload = function () {
            task.ready(null);
        };
    }
};


/**
 *  create a task to fetch an url into a hidden IFRAME.
 *  this is only useful for fetching data from the same origin
 *   as the current page.
 *  only the .onready() of the task will ever be called:
 *  the browser doesn't provide a way to check for
 *   errors in iframes.
 *
 *  @param url url     the url to fetch.
 */
mjt.AsyncIframe = mjt.define_task(null,
                                  [{name: 'url'}]);

mjt.AsyncIframe.prototype.request = function () {
    this.domid = mjt.uniqueid('mjt_iframe');
    this.iframe = mjt.dynamic_iframe(this.domid, this.url);

    var task = this;
    var iframe = this.iframe;
    function inner_document() {
        var idoc = (iframe.contentWindow
                    || iframe.contentDocument);
        if (idoc.document)
            return idoc.document;
        return idoc;
    }

    iframe.onload = function () {
        // works on firefox and hopefully safari
        task.ready(inner_document(iframe));
    };
    iframe.onreadystatechange = function () {
        // works on ie6
        if (iframe.readyState == 'complete') {
            task.ready(inner_document(iframe));
        }
    };
    document.getElementsByTagName('body')[0].appendChild(iframe);
};
})(mjt);

/** crc32.js **/
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

(function(mjt){

    var _tbl = [
        0x00000000, 0x77073096, 0xEE0E612C, 0x990951BA,
        0x076DC419, 0x706AF48F, 0xE963A535, 0x9E6495A3,
        0x0EDB8832, 0x79DCB8A4, 0xE0D5E91E, 0x97D2D988,
        0x09B64C2B, 0x7EB17CBD, 0xE7B82D07, 0x90BF1D91,
        0x1DB71064, 0x6AB020F2, 0xF3B97148, 0x84BE41DE,
        0x1ADAD47D, 0x6DDDE4EB, 0xF4D4B551, 0x83D385C7,
        0x136C9856, 0x646BA8C0, 0xFD62F97A, 0x8A65C9EC,
        0x14015C4F, 0x63066CD9, 0xFA0F3D63, 0x8D080DF5,
        0x3B6E20C8, 0x4C69105E, 0xD56041E4, 0xA2677172,
        0x3C03E4D1, 0x4B04D447, 0xD20D85FD, 0xA50AB56B,
        0x35B5A8FA, 0x42B2986C, 0xDBBBC9D6, 0xACBCF940,
        0x32D86CE3, 0x45DF5C75, 0xDCD60DCF, 0xABD13D59,
        0x26D930AC, 0x51DE003A, 0xC8D75180, 0xBFD06116,
        0x21B4F4B5, 0x56B3C423, 0xCFBA9599, 0xB8BDA50F,
        0x2802B89E, 0x5F058808, 0xC60CD9B2, 0xB10BE924,
        0x2F6F7C87, 0x58684C11, 0xC1611DAB, 0xB6662D3D,
        0x76DC4190, 0x01DB7106, 0x98D220BC, 0xEFD5102A,
        0x71B18589, 0x06B6B51F, 0x9FBFE4A5, 0xE8B8D433,
        0x7807C9A2, 0x0F00F934, 0x9609A88E, 0xE10E9818,
        0x7F6A0DBB, 0x086D3D2D, 0x91646C97, 0xE6635C01,
        0x6B6B51F4, 0x1C6C6162, 0x856530D8, 0xF262004E,
        0x6C0695ED, 0x1B01A57B, 0x8208F4C1, 0xF50FC457,
        0x65B0D9C6, 0x12B7E950, 0x8BBEB8EA, 0xFCB9887C,
        0x62DD1DDF, 0x15DA2D49, 0x8CD37CF3, 0xFBD44C65,
        0x4DB26158, 0x3AB551CE, 0xA3BC0074, 0xD4BB30E2,
        0x4ADFA541, 0x3DD895D7, 0xA4D1C46D, 0xD3D6F4FB,
        0x4369E96A, 0x346ED9FC, 0xAD678846, 0xDA60B8D0,
        0x44042D73, 0x33031DE5, 0xAA0A4C5F, 0xDD0D7CC9,
        0x5005713C, 0x270241AA, 0xBE0B1010, 0xC90C2086,
        0x5768B525, 0x206F85B3, 0xB966D409, 0xCE61E49F,
        0x5EDEF90E, 0x29D9C998, 0xB0D09822, 0xC7D7A8B4,
        0x59B33D17, 0x2EB40D81, 0xB7BD5C3B, 0xC0BA6CAD,
        0xEDB88320, 0x9ABFB3B6, 0x03B6E20C, 0x74B1D29A,
        0xEAD54739, 0x9DD277AF, 0x04DB2615, 0x73DC1683,
        0xE3630B12, 0x94643B84, 0x0D6D6A3E, 0x7A6A5AA8,
        0xE40ECF0B, 0x9309FF9D, 0x0A00AE27, 0x7D079EB1,
        0xF00F9344, 0x8708A3D2, 0x1E01F268, 0x6906C2FE,
        0xF762575D, 0x806567CB, 0x196C3671, 0x6E6B06E7,
        0xFED41B76, 0x89D32BE0, 0x10DA7A5A, 0x67DD4ACC,
        0xF9B9DF6F, 0x8EBEEFF9, 0x17B7BE43, 0x60B08ED5,
        0xD6D6A3E8, 0xA1D1937E, 0x38D8C2C4, 0x4FDFF252,
        0xD1BB67F1, 0xA6BC5767, 0x3FB506DD, 0x48B2364B,
        0xD80D2BDA, 0xAF0A1B4C, 0x36034AF6, 0x41047A60,
        0xDF60EFC3, 0xA867DF55, 0x316E8EEF, 0x4669BE79,
        0xCB61B38C, 0xBC66831A, 0x256FD2A0, 0x5268E236,
        0xCC0C7795, 0xBB0B4703, 0x220216B9, 0x5505262F,
        0xC5BA3BBE, 0xB2BD0B28, 0x2BB45A92, 0x5CB36A04,
        0xC2D7FFA7, 0xB5D0CF31, 0x2CD99E8B, 0x5BDEAE1D,
        0x9B64C2B0, 0xEC63F226, 0x756AA39C, 0x026D930A,
        0x9C0906A9, 0xEB0E363F, 0x72076785, 0x05005713,
        0x95BF4A82, 0xE2B87A14, 0x7BB12BAE, 0x0CB61B38,
        0x92D28E9B, 0xE5D5BE0D, 0x7CDCEFB7, 0x0BDBDF21,
        0x86D3D2D4, 0xF1D4E242, 0x68DDB3F8, 0x1FDA836E,
        0x81BE16CD, 0xF6B9265B, 0x6FB077E1, 0x18B74777,
        0x88085AE6, 0xFF0F6A70, 0x66063BCA, 0x11010B5C,
        0x8F659EFF, 0xF862AE69, 0x616BFFD3, 0x166CCF45,
        0xA00AE278, 0xD70DD2EE, 0x4E048354, 0x3903B3C2,
        0xA7672661, 0xD06016F7, 0x4969474D, 0x3E6E77DB,
        0xAED16A4A, 0xD9D65ADC, 0x40DF0B66, 0x37D83BF0,
        0xA9BCAE53, 0xDEBB9EC5, 0x47B2CF7F, 0x30B5FFE9,
        0xBDBDF21C, 0xCABAC28A, 0x53B39330, 0x24B4A3A6,
        0xBAD03605, 0xCDD70693, 0x54DE5729, 0x23D967BF,
        0xB3667A2E, 0xC4614AB8, 0x5D681B02, 0x2A6F2B94,
        0xB40BBE37, 0xC30C8EA1, 0x5A05DF1B, 0x2D02EF8D
    ];
 
    /**
     * based on code:
     *
     *  Copyright (c) 2006 Andrea Ercolino 
     *  http: *www.opensource.org/licenses/mit-license.php 
     *  Version: 1.2 - 2006/11
     *               - http: *www.mondotondo.com/aercolino/noteslog/?cat=10 
     *
     *
     * sped up by nix - pre-parsed table.
     *
     *  note:
     *     throws away the high bits of unicode chars!
     *     size could be halved with b64-encoded table
     */
    mjt.crc32 = function( /* String */ str, /* Number */ crc ) { 
        if( typeof crc == 'undefined' ) crc = 0; 
        var n = 0; //a number between 0 and 255 
        var x = 0; //an hex number 
        var tbl = _tbl;
 
        crc = crc ^ (-1); 
        for( var i = 0, iTop = str.length; i < iTop; i++ ) { 
            n = ( crc ^ str.charCodeAt( i ) ) & 0xFF; 
            crc = ( crc >>> 8 ) ^ tbl[n];
        } 
        return crc ^ (-1); 
    }; 

    mjt.hash = function (s) { return (mjt.crc32(s)+0x80000000).toString(16).toUpperCase(); };

})(mjt);

/** jsonp.js **/
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

/**
 *
 *  JSONP implementation using mjt.Task
 *
 *  includes several unusual features
 *   - generate JSONP callback= string using hash for better caching
 *   - javascript result cache
 *
 *  uses:
 *    service.js: all
 *    browserio.js:  dynamic_script(), include_js_async()
 *    util.js:   formencode(), uniqueid()
  *               log(), warn(), error()
 *    crc32.js:  hash()
 *
 */

(function(mjt){

mjt.JsonP = mjt.define_task();

// this is the callback lookup table.
// names in this table have been sent to external JSONP
// webservices, embedded in a callback= style argument.
// something should usually be present in this table to
// handle long-delayed responses, even if the task
// timed out.
mjt.JsonP._cb = {};

// this should become a more general task cache.
// it may not be fully separated from _cb yet,
// but it will move into a general UrlFetch class
// perhaps.
mjt.JsonP._cache = {};

/**
 *  flush mjt's internal cache of JSONP responses.
 *
 *  mjt.JsonP caches responses very aggressively, so
 *  apps may need to call this by hand to see changes
 *  after POSTing new data to a service.
 *
 *  this could also be useful in a long-running
 *  application to stop the cache from growing without
 *  bound.
 *
 */
mjt.JsonP.flush_cache = function () {
    mjt.JsonP._cache = {};
};

mjt.JsonP.prototype.init = function () {
    this.url = null;
    this._cbid = null;

    return this;
};

/**
 *  generate a callback id based on an existing url, trying to preserve
 *  http cacheability but not allowing local jsonp callback conflicts.
 *
 *  @param [urlbase]    an url describing the query
 *  @returns            the JSONP callback string
 */
mjt.JsonP.prototype.generate_callback_id = function (urlbase) {
    if (typeof urlbase == 'undefined') {
        this._cbid = mjt.uniqueid('cb');
        return this;
    }

    // try to generate a callback by hashing the url so far
    this._cbid = 'c' + mjt.hash(this.url);

    // if no hash collision, the hash-based callback id will work
    if (typeof mjt.JsonP._cb[this._cbid] == 'undefined')
        return this;

    // hash collision    

    // highly unusual to hit this code so make sure there's something in the logs
    mjt.log('info: repeated jsonp url hash', this._cbid, this.url);

    // we can fallback to mjt.uniqueid() without loss of correctness.
    // we lose http cacheability by using a client sequence number here -
    // could improve this by re-hashing (and re-probing) to generate the 
    // next callback id for this urlbase.
    this._cbid = mjt.uniqueid('cb');
    
    return this;
};


/**
 *  set up the callback table entry.
 *
 *  setting it up means we own it and
 *  are responsible for maintainance
 *  and clean up here too.
 * 
 *  duplicate JsonP tasks do not have callback table entries.
 *
 */
mjt.JsonP.prototype.install = function () {
    mjt.JsonP._cache[this.url] = this;

    // build the callback id from the base url
    this.generate_callback_id(this.url);

    // build the callback url from the base url and the callback id
    var cbstr = this.callback_param + '=mjt.JsonP._cb.' + this._cbid;
    var qsep = /\?/.test(this.url) ? '&' : '?';
    this.cburl = this.url + qsep + cbstr;

    var jsonp = this;
    this._f = function (response) {
        // cleanup the callback table after a JSONP response
        // since duplicate responses should be impossible.
        delete mjt.JsonP._cb[jsonp._cbid];

        jsonp.ready(response);
    };
    mjt.JsonP._cb[this._cbid] = this._f;

    // if a jsonp request times out, leave a mild warning in the callback table.
    // handy because it's possible for a timeout to cause a jsonp task to go into
    // error state, and for the request to subsequently succeed.
    this.onerror(function jsonp_error_cleanup (code, msg) {
        // XXX these warning callbacks could cause the _cb table to build up.
        // they should be removed after some reasonable timeout.
        function warn_stale_jsonp_response () {
            // jsonp_callback_after_error_cleanup
            mjt.log('JSONP already completed with ', code, ':', msg);

            // cleanup since this can only ever arrive once.
            delete mjt.JsonP._cb[jsonp._cbid];
        }

        // not currently used, but useful if you want to clean out old
        // failed entries from the callbacks table
        warn_stale_jsonp_response._stale_jsonp_timed_out = new Date();

        mjt.JsonP._cb[jsonp._cbid] = warn_stale_jsonp_response;
    });

    return this._send_request();
};


/**
 *  send a jsonp request to a complete url
 */
mjt.JsonP.prototype.request = function () {
    if (!this.url)
        throw new Error('jsonp.url should be set, not ' + this.url);

    // if no cached value, send the request
    if (typeof mjt.JsonP._cache[this.url] == 'undefined') {
        // mjt.log('----- JsonP: cache miss');
        return this.install();
    }
    // found a cached request, possibly still in wait state
    var original = mjt.JsonP._cache[this.url];

    // check it for freshness
    // cache_controllers can do service-specific freshness checks.
    // see freebase/api.js for an example of a cache controller.
    if (!(typeof original['cache_controller'] == 'undefined'
          || original.cache_controller === null
          || original.cache_controller.is_fresh(original))) {
        // the cache controller rejected the existing entry.
        // remove the cached value
        // mjt.log('----- JsonP: deleting callback from JsonP cache');
        delete mjt.JsonP._cache[this.url];

        // send a new request
        return this.install();
    }

    // the cached task looks good, so piggy-back on it,
    // note that the task in cache may not have finished yet!
    // the cache prevents redundant simultaneous requests as
    // well as remembering finished ones.
    // note that the event handling thunks pass the ready or error arguments
    // along from the original request to this one.
    // mjt.log('----- JsonP: using JsonP cache');
    return original
        .onready('ready', this)
        .onerror('error', this);
};

// this should become part of a portability layer
mjt.JsonP.prototype._send_request = function () {
    mjt.dynamic_script(undefined,this.cburl);
    return this;
};

/**
 *  this is the most common way to start a JsonP request
 */
mjt.JsonP.prototype.jsonp_request_form = function (urlbase, form, callback_param) {
    var urlquery = typeof form == 'string' ? form : mjt.formencode(form);
    var url = urlbase;
    if (urlquery)
        url += '?' + urlquery;
    this.url = url;
    
    // see: ACRE-1069 and http://support.microsoft.com/kb/208427
    if (typeof acre === 'undefined' && url.length>2083) {
        mjt.warn('mjt.JsonP: Warning: Adding a SCRIPT tag with a url of '+ url.length +
                 ' chars. This is too long for Internet Explorer 7');
        mjt.log(url);
    }
    this.callback_param = callback_param;

    return this.enqueue();
};
})(mjt);

/** xhr.js **/
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


(function(mjt){


mjt.Xhr = mjt.define_task(null,
                          [{ name: 'method'},
                           { name: 'url'},
                           { name: 'content_type', 'default':null },
                           { name: 'body', 'default':null },
                           { name: 'headers', 'default':null }]);

/**
 * mjt.Task wrapper around XMLHttpRequest
 *
 *  @param url          the url of the HTTP request
 *  @param cb           a function to be called with the XHR object when done
 *  @param [posttype]   if this is a POST, gives the content-type
 *  @param [postbody]   if this is a POST, gives the body for the request
 *
 *  the following HTTP header will be added:
 *    X-Metaweb-Request: 1
 * 
 *  Inside onready and onerror handlers you can get at the xhr object
 *  using "this.xhr" because "this" is bound to the task object.
 */
mjt.Xhr.prototype.init = function () {
    var xhr;

    if (typeof XMLHttpRequest != "undefined") {
        xhr = new XMLHttpRequest();
    } else if (typeof ActiveXObject != "undefined") {
        xhr = new ActiveXObject("MSXML2.XmlHttp");
    } else {
        return this.error('no XMLHttpRequest found');
    }
    
    if (this.headers === null)
        this.headers = {};

    this.xhr = xhr;
    return this;
};


mjt.Xhr.prototype.request = function () {
    var task = this;
    var xhr = this.xhr;

    xhr.onreadystatechange = function (e) {
        if (xhr.readyState != 4)
            return task;

        xhr.onreadystatechange = function(){};

        if ((''+xhr.status).charAt(0) == '2')
            return task.ready(xhr);
        return task.error('/apiary/http/status/' + xhr.status, xhr.statusText, xhr.responseText);
    };
    
    xhr.open(this.method, this.url, true);

    if (this.content_type !== null)
        xhr.setRequestHeader('Content-Type', this.content_type);

    // this is added by jquery
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    
    for (header in this.headers) {
        xhr.setRequestHeader(header, this.headers[header]);
    }

    if (this.body === null) {
        var r = xhr.send('');
    } else {
        var r = xhr.send(this.body);
        // save memory
        this.body = null;
    }

    return this;

};



/**
 *
 *
 */
mjt.XhrFormPost = function (url, form, headers) {
    // TODO switch to multipart/form-data for efficiency
    var body = mjt.formencode(form);
    return mjt.Xhr('POST', url,
                   'application/x-www-form-urlencoded', body, headers);
};

})(mjt);

/** freebase_api.js **/
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


/**
 *  Freebase service definitions using JsonP()
 *
 *   uses:
 *     JSON.stringify()
 *     jsonp.js: JsonP()
 *     task.js: define_task()
 *     util.js:  thunk(), formquote, log(), error()
 *
 */

(function (mjt) {


if (typeof mjt.freebase == 'undefined')
    mjt.freebase = {};

mjt.freebase.default_service_url = 'http://www.freebase.com';

mjt.freebase.set_service_url = function (service_url) {
    var loc;
    if (typeof window != 'undefined')
        loc = window.location.protocol + '//' + window.location.host;
    if (typeof acre != 'undefined')
        loc = acre.environ.server_protocol + '//' + acre.environ.host;

    mjt.freebase.service_url = service_url;
    mjt.freebase.xhr_ok = mjt.freebase.service_url == loc ? true : false;

    // if anybody included the schema cache code, initialize it here.
    if (typeof mjt.freebase.SchemaCache != 'undefined') {
        this.schema_cache = new this.SchemaCache(this);
    }
};

mjt.freebase.set_service_url(mjt.freebase.default_service_url);

/**
 *  @class Defines the logic to test the freshness of JsonP tasks 
 *
 *  freshness is based on the mwLastWriteTime cookie.
 *  XXX note that you can only check mwLastWriteTime if the service_url has
 *  the same origin as the current page.
 */
function FreebaseCacheController() {
    // save the mwLastWriteTime cookie, to compare freshness if re-used
    var _mwLastWriteTime = mjt.freebase.readCookie('mwLastWriteTime');
    this.is_fresh = function(task) {
        
        var mwLastWriteTime = mjt.freebase.readCookie('mwLastWriteTime'); // latest cookie
        
        // if tokens are not identical then a write (or login) has happened
        return (_mwLastWriteTime == mwLastWriteTime);
    };
}


/**
 *  @class a task which depends on an external mjt.JsonP task.
 *
 */
mjt.freebase.FreebaseJsonPTask = mjt.define_task();

mjt.freebase.FreebaseJsonPTask.prototype.init = function() {
    this.jsonp = mjt.JsonP();
    
    if (typeof mjt.freebase.readCookie != 'undefined') {
        // this wraps the current lastwrite cookie in a closure
        //  for later comparison.
        this.jsonp.cache_controller = new FreebaseCacheController();
    }
};

/**
 *  make a single jsonp request to freebase.com
 *
 */
mjt.freebase.FreebaseJsonPTask.prototype.service_request = function(path, form) {
    var service_url = mjt.freebase.service_url;
    // the service_url may be overridden on a task-by-task basis, see Touch() for example
    if (typeof this.service_url != 'undefined' && this.service_url)
        service_url = this.service_url;
    var url = service_url + path;

    this.jsonp.set_timeout()
        .jsonp_request_form(url, form, 'callback')
        .onready('handle_envelope', this)
        .onerror('handle_error_jsonp', this);

    return this;
};


/**
 *  handle a jsonp response from freebase.com
 *
 */
mjt.freebase.FreebaseJsonPTask.prototype.handle_envelope = function (o) {
    //mjt.log('freebase.BaseTask.handle_envelope', this, o.code);
    if (o.code != '/api/status/ok') {
        var msg = o.messages[0];
        return this.error(msg.code, msg.message, msg);
    }
    return this.response(o);
};


/**
 *  handle errors at the jsonp layer
 *
 */
mjt.freebase.FreebaseJsonPTask.prototype.handle_error_jsonp = function() {
    //mjt.warn('JSONP ERROR', arguments);
    this.error.apply(this, arguments);
};

/**
 *  send the request
 *
 *  "subclasses" of BaseTask should override this
 *
 */
mjt.freebase.FreebaseJsonPTask.prototype.request = function() {
    mjt.error('must override BaseTask.request()');
};

/**
 *  "subclasses" of BaseTask should override this
 *
 */
mjt.freebase.FreebaseJsonPTask.prototype.response = function(o) {
    mjt.error('must override BaseTask.response()');
};


//////////////////////////////////////////////////////////////////////

/**
 *
 */
mjt.freebase.MqlRead = mjt.define_task(mjt.freebase.FreebaseJsonPTask,
                          [{name:'query'},
                           {name:'qenv', 'default':{}}]);

/**
 *
 */
mjt.freebase.MqlRead.prototype.build_envelope = function () {
    var envelope = {
        escape: false
    };

    for (var k in this.qenv)
        envelope[k] = this.qenv[k];

    envelope.query = this.query;

    if (this.query instanceof Array) {
        if (typeof envelope.cursor == 'undefined') {
            envelope.cursor = true;  // always ask for cursor with multiple results
            this.start = 0;
        }

        // if the cursor is already present, we can't know this.start.
        // if this MqlRead was set up by a pager from a previous mqlread,
        //  this.start should have been set by the .next() method there.

        this.requested_count = this.query[0].limit || 100;
    }
    return envelope;
};

/**
 *
 */
mjt.freebase.MqlRead.prototype.request = function () {
    var envelope = this.build_envelope();

    var s = JSON.stringify(envelope);
    return this.service_request('/api/service/mqlread', { query: s });
};

/**
 *
 */
mjt.freebase.MqlRead.prototype.response = function(o) {
    if (o.result === null)
        return this.error('/user/mjt/messages/empty_result',
                          'no results found');

    if (typeof o.cursor === 'string')
        this.next_cursor = o.cursor;

    if (o.result instanceof Array) {
        this.count = o.result.length;

        this.more_available = false;

        // was the last read shorter than requested?
        // did the last read return cursor == false?
        if (this.count >= this.requested_count
            && this.next_cursor != false)
            this.more_available = true;
    }

    return this.ready(o.result);
};


/**
 *  creates a new read request that continues this
 *   query using the returned cursor.  by default it
 *   requests the same number of results as the last
 *   query.
 *  @param {reqcount} how many more results to request
 *  @returns the new instance of MqlRead
 */
mjt.freebase.MqlRead.prototype.next = function (reqcount) {
    if (this.state !== 'ready') {
        throw new Error('MqlRead.next(): bad state ' + this.state);
    }

    if (!this.more_available) {
        // app shouldn't be asking for more
        mjt.warn('paging .next(): no more items', this);
        return null;
    }

    // we're going to mess with the toplevel .limit, but
    //  everything else we copy.
    var qold = this.query[0]
    var q = {};
    for (var k in qold) {
        if (qold.hasOwnProperty(k))
            q[k] = qold[k];
    }

    if (typeof reqcount != 'undefined')
        q.limit = reqcount;

    var task = mjt.freebase.MqlRead([q], { cursor: this.next_cursor });
    task.start = this.start + this.count;

    return task;
};


//////////////////////////////////////////////////////////////////////

/**
 *  @class bundles multiple MqlReads into a single HTTP request.
 *  @constructor
 *
 *  this works by combining multiple MqlRead tasks, rather
 *  than combining multiple JSON queries.  not intuitive and should
 *  be changed.
 */
mjt.freebase.MqlReadMultiple = mjt.define_task(mjt.freebase.FreebaseJsonPTask);

mjt.freebase.MqlReadMultiple.prototype.init = function () {
    this.reads = {};
};

/**
 *
 */
mjt.freebase.MqlReadMultiple.prototype.request = function () {
    var queries = {};
    for (var k in this.reads)
        queries[k] = this.reads[k].build_envelope();
    var s = JSON.stringify(queries);
    return this.service_request('/api/service/mqlread', { queries: s });
};

/**
 *  add a new query
 *
 *  @param key  identifies the subquery
 *  @param q    the mql subquery
 *
 */
mjt.freebase.MqlReadMultiple.prototype.mqlread = function (key, task) {
    this.reads[key] = task;
    return this;
};

/**
 *
 */
mjt.freebase.MqlReadMultiple.prototype.response = function (o) {
    for (var k in this.reads) {
        var task = this.reads[k];
        task.handle_envelope(o[k]);
    }
    return this.ready(o.result);
};


//////////////////////////////////////////////////////////////////////

/**
 *
 */
mjt.freebase.TransGet = mjt.define_task(mjt.freebase.FreebaseJsonPTask,
                           [{ name:'id' },
                            { name:'trans_type', 'default': 'raw' },
                            { name:'values', 'default': null }]);

/**
 *
 */
mjt.freebase.TransGet.prototype.request = function() {
    if (this.values === null) this.values = {};
    var path = '/api/trans/' + this.trans_type + this.id;
    return this.service_request(path, this.values);
};

/**
 *
 */
mjt.freebase.TransGet.prototype.response = function(o) {
    // XXX workaround for https://bugs.freebase.com/browse/ME-1397
    o.result.media_type = o.result.media_type.replace(/^\/media_type\//, '');
    if (typeof o.result.text_encoding == 'string')
        o.result.text_encoding = o.result.text_encoding.replace(/^\/media_type\/text_encoding\//, '');
    // end workaround

    return this.ready(o.result);
};


//////////////////////////////////////////////////////////////////////

/**
 *  mjt.task wrapper for freebase /api/service/touch
 *  the service_url allows you to touch a different server,
 *  though that may not help if the browser has third-party cookies blocked.
 */
mjt.freebase.Touch = mjt.define_task(mjt.freebase.FreebaseJsonPTask,
                                 [{name:'service_url', 'default':null}]);

/**
 *
 */
mjt.freebase.Touch.prototype.request = function () {
    // Touch should never be cached
    this.jsonp.cache_controller = {
        is_fresh : function(task) {
            return false;
        }
    };
    
    return this.service_request('/api/service/touch');
};

mjt.freebase.Touch.prototype.response = function(o) {
    // no response expected for now but whatever
    return this.ready(null);
};


})(mjt);


/** freebase_isodate.js **/
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



/**
 * 
 * ISO 8601 date functions
 * 
 * parsing originally from dojo.date.serialize
 *
 * according to http://svn.dojotoolkit.org/src/trunk/LICENSE :
 *    Dojo is availble under *either* the terms of the modified BSD license *or* the
 *    Academic Free License version 2.1.
 * 
 * 
 * formatting from http://delete.me.uk/2005/03/iso8601.html
 * 
 *   "This code is available under the AFL. This should mean
 *    you can use it pretty much anyway you want."
 */

/* - repackaged for mjt
 * - inlined dojo.string.pad
 * - return NaN rather than null for consistency with builtin Date.parse()
 * but not much else done hopefully */

(function (mjt) {

var setIso8601 = function(/*Date*/dateObject, /*String*/formattedString){
	// summary: sets a Date object based on an ISO 8601 formatted string (uses date and time)
	var comps = (formattedString.indexOf("T") == -1) ? formattedString.split(" ") : formattedString.split("T");
	dateObject = setIso8601Date(dateObject, comps[0]);
	if(comps.length == 2){ dateObject = setIso8601Time(dateObject, comps[1]); }
	return dateObject; /* Date or null */
};

var fromIso8601 = function(/*String*/formattedString){
	// summary: returns a Date object based on an ISO 8601 formatted string (uses date and time)
	return setIso8601(new Date(0, 0), formattedString);
};

var setIso8601Date = function(/*String*/dateObject, /*String*/formattedString){
	// summary: sets a Date object based on an ISO 8601 formatted string (date only)
	var regexp = "^(-?[0-9]{4})((-?([0-9]{2})(-?([0-9]{2}))?)|" +
			"(-?([0-9]{3}))|(-?W([0-9]{2})(-?([1-7]))?))?$";
	var d = formattedString.match(new RegExp(regexp));
	if(!d){
		mjt.log("invalid date string: " + formattedString);
		return NaN;
	}
	var year = d[1];
	var month = d[4];
	var date = d[6];
	var dayofyear = d[8];
	var week = d[10];
	var dayofweek = d[12] || 1;

	dateObject.setFullYear(year);

	if(dayofyear){
		dateObject.setMonth(0);
		dateObject.setDate(Number(dayofyear));
	}
	else if(week){
		dateObject.setMonth(0);
		dateObject.setDate(1);
		var day = dateObject.getDay() || 7;
		var offset = Number(dayofweek) + (7 * Number(week));
	
		if(day <= 4){ dateObject.setDate(offset + 1 - day); }
		else{ dateObject.setDate(offset + 8 - day); }
	} else{
		if(month){
			dateObject.setDate(1);
			dateObject.setMonth(month - 1); 
		}
		if(date){ dateObject.setDate(date); }
	}

	return dateObject; // Date
};

var fromIso8601Date = function(/*String*/formattedString){
	// summary: returns a Date object based on an ISO 8601 formatted string (date only)
	return setIso8601Date(new Date(0, 0), formattedString);
};

var setIso8601Time = function(/*Date*/dateObject, /*String*/formattedString){
	// summary: sets a Date object based on an ISO 8601 formatted string (time only)

	// first strip timezone info from the end
	var timezone = "Z|(([-+])([0-9]{2})(:?([0-9]{2}))?)$";
	var d = formattedString.match(new RegExp(timezone));

	var offset = 0; // local time if no tz info
	if(d){
		if(d[0] != 'Z'){
			offset = (Number(d[3]) * 60) + Number(d[5] || 0);
			if(d[2] != '-'){ offset *= -1; }
		}
		offset -= dateObject.getTimezoneOffset();
		formattedString = formattedString.substr(0, formattedString.length - d[0].length);
	}

	// then work out the time
	var regexp = "^([0-9]{2})(:?([0-9]{2})(:?([0-9]{2})(\.([0-9]+))?)?)?$";
	d = formattedString.match(new RegExp(regexp));
	if(!d){
		mjt.log("invalid time string: " + formattedString);
		return NaN;
	}
	var hours = d[1];
	var mins = Number(d[3] || 0);
	var secs = d[5] || 0;
	var ms = d[7] ? (Number("0." + d[7]) * 1000) : 0;

	dateObject.setHours(hours);
	dateObject.setMinutes(mins);
	dateObject.setSeconds(secs);
	dateObject.setMilliseconds(ms);

	if(offset !== 0){
		dateObject.setTime(dateObject.getTime() + offset * 60000);
	}	
	return dateObject; // Date
};

var fromIso8601Time = function(/*String*/formattedString){
	// summary: returns a Date object based on an ISO 8601 formatted string (date only)
	return setIso8601Time(new Date(0, 0), formattedString);
};


/* RFC-3339 Date Functions
 *************************/

var toRfc3339 = function(/*Date?*/dateObject, /*String?*/selector){
//	summary:
//		Format a JavaScript Date object as a string according to RFC 3339
//
//	dateObject:
//		A JavaScript date, or the current date and time, by default
//
//	selector:
//		"dateOnly" or "timeOnly" to format selected portions of the Date object.
//		Date and time will be formatted by default.

//FIXME: tolerate Number, string input?
	if(!dateObject){
		dateObject = new Date();
	}

        // inlined from dojo.string.pad()
	var _ = function(/* string */str, /* integer */len/*=2*/, /* string */ c/*='0'*/, /* integer */dir/*=1*/) {
	//	summary
	//	Pad 'str' to guarantee that it is at least 'len' length with the character 'c' at either the 
	//	start (dir=1) or end (dir=-1) of the string
	var out = String(str);
	if(!c) {
		c = '0';
	}
	if(!dir) {
		dir = 1;
	}
	while(out.length < len) {
		if(dir > 0) {
			out = c + out;
		} else {
			out += c;
		}
	}
	return out;	//	string
        }
	var formattedDate = [];
	if(selector != "timeOnly"){
		var date = [_(dateObject.getFullYear(),4), _(dateObject.getMonth()+1,2), _(dateObject.getDate(),2)].join('-');
		formattedDate.push(date);
	}
	if(selector != "dateOnly"){
		var time = [_(dateObject.getHours(),2), _(dateObject.getMinutes(),2), _(dateObject.getSeconds(),2)].join(':');
		var timezoneOffset = dateObject.getTimezoneOffset();
		time += (timezoneOffset > 0 ? "-" : "+") + 
					_(Math.floor(Math.abs(timezoneOffset)/60),2) + ":" +
					_(Math.abs(timezoneOffset)%60,2);
		formattedDate.push(time);
	}
	return formattedDate.join('T'); // String
};

var fromRfc3339 = function(/*String*/rfcDate){
//	summary:
//		Create a JavaScript Date object from a string formatted according to RFC 3339
//
//	rfcDate:
//		A string such as 2005-06-30T08:05:00-07:00
//		"any" is also supported in place of a time.

	// backwards compatible support for use of "any" instead of just not 
	// including the time
	if(rfcDate.indexOf("Tany")!=-1){
		rfcDate = rfcDate.replace("Tany","");
	}
	var dateObject = new Date();
	return setIso8601(dateObject, rfcDate); // Date or null
};


////////////////////////////////////////////////////////////////////////////


/**
 *  from  http://delete.me.uk/2005/03/iso8601.html
 *  which is the original source of the dojo parsing too.
 *
 */

var toISO8601String = function (date, format, offset) {
 /* accepted values for the format [1-6]:
 1 Year:
 YYYY (eg 1997)
 2 Year and month:
 YYYY-MM (eg 1997-07)
 3 Complete date:
 YYYY-MM-DD (eg 1997-07-16)
 4 Complete date plus hours and minutes:
 YYYY-MM-DDThh:mmTZD (eg 1997-07-16T19:20+01:00)
 5 Complete date plus hours, minutes and seconds:
 YYYY-MM-DDThh:mm:ssTZD (eg 1997-07-16T19:20:30+01:00)
 6 Complete date plus hours, minutes, seconds and a decimal
 fraction of a second
 YYYY-MM-DDThh:mm:ss.sTZD (eg 1997-07-16T19:20:30.45+01:00)
 */
    if (!format) { format = 6; }
    if (!offset) {
        offset = 'Z';
    } else {
        var d = offset.match(/([-+])([0-9]{2}):([0-9]{2})/);
        var offsetnum = (Number(d[2]) * 60) + Number(d[3]);
        offsetnum *= ((d[1] == '-') ? -1 : 1);
        date = new Date(Number(Number(date) + (offsetnum * 60000)));
    }

    var zeropad = function (num) { return ((num < 10) ? '0' : '') + num; };

    var str = "";
    str += date.getUTCFullYear();
    if (format > 1) { str += "-" + zeropad(date.getUTCMonth() + 1); }
    if (format > 2) { str += "-" + zeropad(date.getUTCDate()); }
    if (format > 3) {
        str += "T" + zeropad(date.getUTCHours()) +
               ":" + zeropad(date.getUTCMinutes());
    }
    if (format > 5) {
        var secs = Number(date.getUTCSeconds() + "." +
                   ((date.getUTCMilliseconds() < 100) ? '0' : '') +
                   zeropad(date.getUTCMilliseconds()));
        str += ":" + zeropad(secs);
    } else if (format > 4) { str += ":" + zeropad(date.getUTCSeconds()); }

    if (format > 3) { str += offset; }
    return str;
};

////////////////////////////////////////////////////////////////////////////

/**
 *  convert a date specified as an ISO8601 / W3C formatted string
 *  to a javascript Date object.
 */
mjt.freebase.date_from_iso = function (isodate) {
    if (typeof isodate == 'undefined' || isodate === null)
        return NaN;
    return fromIso8601(isodate.toString());
};

/**
 *  convert a a javascript Date object to a string containing
 *  an ISO8601 / W3C formatted representation.
 */

mjt.freebase.date_to_iso = function (d) {
    return toISO8601String(d);
};

    
})(mjt);

/** freebase_misc.js **/
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


(function (mjt) {

mjt.freebase.imgurl = function(cid, maxwidth, maxheight, mode, errorid) {
    var qargs = {};
    if (typeof maxwidth !== 'undefined') {
        qargs.maxwidth = maxwidth;
    }
    if (typeof maxheight !== 'undefined') {
        qargs.maxheight = maxheight;
    }
    if (typeof mode !== 'undefined') {
        qargs.mode = mode;
    }
    if (typeof mode !== 'undefined') {
        qargs.errorid = errorid;
    }

    // the formquote is necessary to handle old-style #guids,
    // and should be harmless on valid mql ids.
    return mjt.form_url(this.service_url + '/api/trans/image_thumb'
                        + mjt.formquote(cid),
                        qargs);
};


/**
 *  Applies parameters to a query
 *
 *  @param query     a mql query
 *  @param paths     an object of paramaters where the key is a path and the value is an updated value
 */
mjt.freebase.extend_query = function (query, paths) {
    if (typeof paths == 'undefined')
        paths = {};
    if (typeof query == 'undefined')
        throw new Error('extend_query: MQL query is undefined');

    // go through all the substitutions in the paths dict,
    // patching query accordingly.
    for (var path in paths) {
        var val = paths[path];

        // turn the path expression into a list of keys
        var pathkeys = path.split('.');
        var last_key = pathkeys.pop();

        // walk the obj variable down the path starting
        // at the query root
        var obj = query instanceof Array ? query[0] : query;

        for (var i = 0; i < pathkeys.length; i++) {
            var key = pathkeys[i];
            // If we're on an uncreated frontier, create it.
            if (typeof obj[key] != 'object' || obj[key] === null) {
                obj[key] = {};
            }
            obj = obj[key];
            if (obj instanceof Array) {
                if (obj.length == 0)
                    obj = [{}];

                if (obj.length > 1)
                    throw new Error('extend_query: path ' + JSON.stringify(path)
                                    + ' references an array with more than one element');

                obj = obj[0];
            }
        }

        if (obj === null || typeof obj != 'object') {
            throw new Error('extend_query: path ' + JSON.stringify(path)
                           + ' does not exist in query');
        }

        // patch in the final value
    obj[last_key] = val;
    }
    return query;
};
})(mjt);

/** freebase_mqlkey.js **/
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



(function (mjt) {

/**
 *
 *  routines to quote and unquote javascript strings as valid mql keys
 * 
 */

var mqlkey_start = 'A-Za-z0-9';
var mqlkey_char = 'A-Za-z0-9_-';

var MQLKEY_VALID = new RegExp('^[' + mqlkey_start + '][' + mqlkey_char + ']*$');

var MQLKEY_CHAR_MUSTQUOTE = new RegExp('([^' + mqlkey_char + '])', 'g');


/**
 *  quote a unicode string to turn it into a valid mql /type/key/value
 *
 */
mjt.freebase.mqlkey_quote = function (s) {
    if (MQLKEY_VALID.exec(s))   // fastpath
        return s;

    var convert = function(a, b) {
        var hex = b.charCodeAt(0).toString(16).toUpperCase();
        if (hex.length == 2)
            hex = '00' + hex;
        return '$' + hex;
    };

    x = s.replace(MQLKEY_CHAR_MUSTQUOTE, convert);

    if (x.charAt(0) == '-' || x.charAt(0) == '_') {
        x = convert(x,x.charAt(0)) + x.substr(1);
    }

    // TESTING
    /*
    if (mjt.debug && mqlkey_unquote(x) !== s) {
        mjt.log('failed roundtrip mqlkey quote', s, x);
    }
    */
    return x;
}


/**
 *  unquote a /type/key/value string to a javascript string
 *
 */
mjt.freebase.mqlkey_unquote = function (x) {
    x = x.replace(/\$([0-9A-Fa-f]{4})/g, function (a,b) {
        return String.fromCharCode(parseInt(b, 16));
    });
    return x;
}

// convert a mql id to an id suitable for embedding in a url path.
// UNTESTED
// and DEPRECATED
var mqlid_to_mqlurlid = function (id) {
    if (id.charAt(0) === '~') {
        return id;
    }

    if (id.charAt(0) === '#') {
        return '%23' + id.substr(1);
    }

    if (id.charAt(0) !== '/') {
        return 'BAD-ID';
    }

    // requote components as keys and rejoin.
    var segs = id.split('/');
    var keys = [];
    for (var i = 1; i < segs.length; i++) {
        var seg = segs[i];
        // conservative uri encoding for now
        keys.push(encodeURIComponent(mqlkey_unquote(seg)));
    }
    // urlids do not have leading slashes!!!
    return '/'.join(keys);
}

})(mjt);

/** freebase_xhr.js **/
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


(function (mjt, fb) {

/*
 * from the client code.
 *
 * returns the value of a cookie given the cookie name.
 *
 */
fb.readCookie = function (name){
  if (typeof acre != 'undefined') {
      if (typeof acre.environ.cookies[name] == 'undefined')
          return '';

      var cookie = acre.environ.cookies[name];
      return cookie.value;
  }

  if (typeof document == 'undefined') return '';

  var cookieValue = "";
  name += "=";
  if(document.cookie.length > 0){
    var offset = document.cookie.indexOf(name);
    if(offset != -1){
      offset += name.length;
      var end = document.cookie.indexOf(";", offset);
      if(end == -1) end = document.cookie.length;
      cookieValue = document.cookie.substring(offset, end);
    }
  }
  return cookieValue;
};

/*
 * parse the metaweb-user-info cookie
 * based on code from tim k and alee.
 */
fb.parse_metaweb_cookies = function () {
    function _cookieItem(c, i) {
        var s = c.indexOf('|'+i+'_');
        if (s != -1) {
            s = s + 2 + i.length;
            var e = c.indexOf('|',s);
            if (e != -1)
                return decodeURIComponent(c.substr(s,e-s));
        }
        return null;
    }

    mjt.freebase.freebase_user = null;

    // get user info from cookie:
    var cookieInfo = fb.readCookie("metaweb-user-info");
    if (cookieInfo.indexOf('A|') == 0) {
        // Using new cookie format (which is extensible and Unicode-safe)
        // 'g' = User GUID, 'u' = user account name, 'p' = path name of user obj
        // mimic the /type/user schema
        var user = { type: '/type/user' };
        user.id = _cookieItem(cookieInfo, 'p');
        user.guid = _cookieItem(cookieInfo, 'g');
        user.name = _cookieItem(cookieInfo, 'u');
        if (!user.id)
            user.id = user.guid;

        mjt.freebase.freebase_user = user;
    }
};

// run at startup
fb.parse_metaweb_cookies();

fb.FreebaseXhrTask = mjt.define_task(null);

fb.FreebaseXhrTask.prototype.init = function () {
};

fb.FreebaseXhrTask.prototype.xhr_request = function (method, url, content_type, body) {
    url = fb.service_url + url;
    this.xhr = mjt.Xhr(method, url, content_type, body).enqueue();
    this.xhr
        .onready('xhr_ready', this)
        .onerror('xhr_error', this, this.xhr.xhr);
    return this;
};

fb.FreebaseXhrTask.prototype.xhr_form_post = function (url, form) {
    url = fb.service_url + url;
    this.xhr = mjt.XhrFormPost(url, form).enqueue();
    this.xhr
        .onready('xhr_ready', this)
        .onerror('xhr_error', this, this.xhr.xhr);
    return this;
};

fb.FreebaseXhrTask.prototype.request = function () {
};

/**
 * handle responses from XHR requests to the metaweb service.
 * this handles the response envelope.
 */
fb.FreebaseXhrTask.prototype.xhr_ready = function (xhr) {
    // try to parse a json body regardless of status
    var prect = xhr.getResponseHeader('content-type');

    var ct = prect ? prect.replace(/;.*$/, '') : '';
    if (!ct.match(/^(application\/json|text\/javascript|text\/plain)$/))
        return this.error('/user/mjt/messages/json_response_expected',
                          'status: ' + xhr.status + ', content-type: ' + ct,
                          xhr.responseText);

    var o = JSON.parse(xhr.responseText);

    this.envelope = o;

    if (o.code !== '/api/status/ok')
        return this.error(o.code,
                          o.messages[0].message,
                          o.messages[0]);

    return this.ready(o.result);
};

fb.FreebaseXhrTask.prototype.xhr_error = function (xhr, code, msg, info) {
    // try to parse xhr body as JSON
    var errjson = null;
    try {
        errjson = JSON.parse(info);
        var errmsg = errjson.messages[0];
        return this.error(errmsg.code, errmsg.message, errmsg);
    } catch (e) {
        return this.error(code, msg, info);
    }
};


//////////////////////////////////////////////////////////////////////

/**
*  Task for /api/trans/unsafe
*  that is an xhr rather than jsonp task
*
*  @param id  str     the freebase id of the /common/document
*/

fb.TransUnsafe = mjt.define_task(null, [{ name:'id' }]);
                            

fb.TransUnsafe.prototype.xhr_request = function (method, url, content_type, body) {
    url = fb.service_url + url;
    this.xhr = mjt.Xhr(method, url, content_type, body).enqueue();
    this.xhr
        .onready('xhr_ready', this)
        .onerror('xhr_error', this, this.xhr.xhr);
    return this;
};

fb.TransUnsafe.prototype.xhr_ready = function (xhr) {
    var prect = xhr.getResponseHeader('content-type');
    var ct = prect ? prect.replace(/;.*$/, '') : '';
    this.content_type = ct;
    this.responseText = xhr.responseText
    
    return this.ready();
};

fb.TransUnsafe.prototype.xhr_error = function (xhr, code, msg, info) {
    return this.error(code, msg, info);
};

fb.TransUnsafe.prototype.request = function() {
    var path = '/api/trans/unsafe' + this.id;

    return this.xhr_request('GET', path);
};


//////////////////////////////////////////////////////////////////////

fb.MqlWrite = mjt.define_task(fb.FreebaseXhrTask,
                              [{ name: 'query' },
                               { name: 'qenv' , 'default': {}}]);

fb.MqlWrite.prototype.request = function() {
    var qenv = { query: this.query };
    for (var k in this.qenv)
        qenv[k] = this.qenv[k];
    var qstr = JSON.stringify(qenv);

    return this.xhr_form_post('/api/service/mqlwrite',
                              { query: qstr });
};

//////////////////////////////////////////////////////////////////////

/**
 *  mjt.task wrapper for freebase /api/service/touch
 */
// XXX is this still used?  there is a GET version in mjt.freebase.Touch
fb.FlushCache = mjt.define_task(fb.FreebaseXhrTask);

fb.FlushCache.prototype.request = function() {
    return this.xhr_request('POST', '/api/service/touch');
};

fb.FlushCache.prototype.xhr_ready = function (xhr) {
    return this.ready(null);
};


//////////////////////////////////////////////////////////////////////

/**
 *  mjt.task wrapper for freebase file upload service
 */
fb.Upload = mjt.define_task(fb.FreebaseXhrTask,
                          [{ name: 'content_type' },
                           { name: 'body' },
                           { name: 'values' }]);



fb.Upload.prototype.request = function() {
    var path = '/api/service/upload';
    var qargs = mjt.formencode(this.values);
    if (qargs)
        path += '?' + qargs;

    return this.xhr_request('POST', path, this.content_type, this.body);
};


//////////////////////////////////////////////////////////////////////

/**
 *  mjt.task wrapper for freebase signin service
 */

fb.Signin = mjt.define_task(fb.FreebaseXhrTask,
                                  [{ name: 'username' },
                                   { name: 'password' },
                                   { name: 'domain', 'default': null },
                                   { name: 'options', 'default': {} }]);

fb.Signin.prototype.request = function() {
    if (typeof this.username == 'undefined')
        return this.xhr_form_post('/api/account/logout', {});

    var form = { username: this.username,
                 password: this.password };
    if (this.domain !== null)
        form.domain = this.domain;
    for (var k in this.options)
        form[k] = this.options[k];

    return this.xhr_form_post('/api/account/login', form)
        .ondone('clear_password', this);
};

fb.Signin.prototype.clear_password = function() {
    delete this.password;
    return this;
};

//////////////////////////////////////////////////////////////////////


})(mjt, mjt.freebase);

/** markup.js **/
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



/**
 *  "markup" is a representation of markup-under-construction.
 *  this incorporates two tricks i learned from the "Kid" template
 *  engine - i don't know where ryan tomayko learned them.
 * 
 *  the first trick is a generalization of the old method of building a
 *  long string as a list (with O(1) append time) and then joining
 *  the list into a string at the last minute, rather than
 *  trying to keep the string-under-construction as a contiguous
 *  string at all times which gets very expensive.
 *  in a template language you also have to deal with splicing
 *  in results from function calls, so you end up with a nested
 *  list of strings rather than a flat list of strings and you need
 *  to flatten the tree before joining it.
 *
 *  the other trick is to optionally tag strings according to where
 *  they came from.  a bare string was produced by naive code, so
 *  it is assumed that the markup is not HTML-escaped and must be escaped
 *  to prevent script injection and to allow "< > &" to output as expected.
 *  strings that are produced by the template itself were written by the
 *  template author, so they are assumed to be safe HTML and are tagged
 *  by being wrapped in a javascript object.
 * 
 * 
 * - bare strings are valid in markup lists, though they will be escaped
 *   before converting to a markup string.
 * 
 * - to tag a string as safe markup, use: 
 *      mjt.bless("...some markup here...")
 * 
 * - to convert a markup list to a markup string, use mjt.flatten_markup()
 *      
 *      mjt.flatten_markup([mjt.bless("<div>"),
 *                          ["a > b", " && ", "b > c"], 
 *                          mjt.bless("</div>")])
 *       ->  "<div>a &gt; b &amp;&amp; b &gt; c</div>"
 * 
 * - to convert a TemplateCall (the result of invoking a template function
 *   from javascript) to a markup string, use:
 *      tcall.toMarkup()
 *      or mjt.flatten_markup(tcall)
 *      or acre.markup.stringify(tcall) under acre
 * 
 */


(function(mjt){


/**
 * external entry point to create markup from a trusted string.
 * 
 * mjt.bless requires a string argument.
 * 
 */
mjt.bless = function (html) {
    return new mjt.Markup(html);
};

/**
 * mjt.MarkupList is sort-of-like Array for returning incremental
 *  template results.  The only reason to not use Array itself is
 *  to make it clear that MarkupList is a tree of markup rather
 *  than a generic Array.
 */
mjt.MarkupList = function () {        // varargs
    for (var i = 0; i < arguments.length; i++)
        this[i] = arguments[i];
};

/**
 * constructor for Markup objects, which contain strings
 *  that should be interpreted as markup rather than quoted.
 */
mjt.Markup = function (html) {
    this.html = html;
};

/**
 * any object can define a toMarkup() method and
 *  return a representation of itself as a markup
 *  stream.  the Markup constructor is used internally
 *  but there's nothing special about it.
 */
mjt.Markup.prototype.toMarkup = function () {
    return this.html;
};

(function () {
    function bad_markup_element(v, msg, markup) {
        markup.push('<span style="outline-style:solid;color:red;">');
        if (msg) {
            markup.push(msg);
            markup.push('</span>');
        } else {
            // could use __proto__ for more info about objects
            markup.push('bad markup element, type [');
            markup.push(typeof(v));
            markup.push(']</span>');
        }
    }

    function flatn(x, markup) {
        //mjt.log('flatn', x);
        switch (typeof x) {
          case 'object':
            if (x === null) {
                bad_markup_element(x, '[null]', markup); // null
            } else if (x instanceof mjt.MarkupList) {
                for (var i = 0; i in x; i++)
                    flatn(x[i], markup);
            } else if (typeof x.toMarkupList === 'function') {
                flatn(x.toMarkupList(), markup);
            } else if (typeof x.toMarkup === 'function') {
                markup.push(x.toMarkup());
            } else if (typeof x.toString === 'function') {
                markup.push(mjt.htmlencode(x.toString()));
            } else {
                bad_markup_element(x, '[object]', markup);
            }
            break;
          case 'undefined':
            bad_markup_element(x, '[undefined]', markup);
            break;
          case 'string':
            markup.push(mjt.htmlencode(x));
            break;
          case 'boolean':
            markup.push(String(x));
            break;
          case 'number':
            markup.push(String(x));
            break;

          // could eval functions like genshi, this could
          //   allow lazier construction of the result
          //   strings with possible lower memory footprint.
          //   might be important because of the lame ie6 gc.
          //   right now it all gets generated and joined
          //   from a single list anyway.
          case 'function':
            bad_markup_element(x, '[function]', markup);
            break;
        };
        return markup;
    }

    /**
     * hopefully fast function to flatten a nested markup list
     *  into a string.
     *   instances of Markup are passed through
     *   bare strings are html encoded
     *   other objects are errors
     *
     * this would be a good optimization target to speed up
     *  template rendering, it is one of the closest things
     *  there is to an inner loop.
     */
    mjt.flatten_markup = function (v) {
        return flatn(v, []).join('');
    };
})();

/**
 *   eliminate any markup constructs that are illegal
 *   in an XML attribute: do escaping for &lt; &gt; and &quot;
 *   characters
 *   &amp; is NOT escaped here because it is legal inside
 *   the attribute.  this function is therefore not reversible.
 *   the purpose here is to avoid generating ill-formed markup
 *   if someone generates an xml tag into an attribute.
 */
mjt.make_attr_safe = function (v) {
    return mjt.bless(mjt.flatten_markup(v)
           .replace(/\</g,'&lt;')
           .replace(/\>/g,'&gt;')
           .replace(/\"/g,'&quot;'));
};


})(mjt);

/** eval.js **/
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

(function(mjt){

/**
 * try to generate a reasonable javascript error report in html.
 *
 * @param e Error             the javascript error object
 * @param codestr string      the source code where the error is located
 * @param [target_id] string  value to use for id= in the generated markup
 * @returns Markup the generated html as a Markup object
 *
 */
mjt.error_html = function (e, codestr, target_id) {
    // FF3            Safari         IE7
    // e.fileName     e.sourceURL    NA
    // e.lineNumber   e.line         NA
    // e.stack        NA             NA
    // for more info see http://mqlx.com/~willmoffat/learn_feature/javascript_exceptions/browser_exception_properties.html
    var source = [];

    if (codestr && e.lineNumber) {
        var lineno = e.lineNumber;
        var lines = codestr.split('\n');

        if (lineno < 0)
            lineno = 0;
        if (lineno >= lines.length)
            lineno = lines.length - 1;

        var line0 = lineno - 10;
        if (line0 < 0) line0 = 0;

        var cx = [];
        var line;

        source.push(mjt.bless(['\n<pre>']));
        for (line = line0; line < lineno; line++)
            cx.push(lines[line]);
        source.push(cx.join('\n'));

        source.push(mjt.bless(['</pre>\n<pre style="color:red">']));
        source.push(lines[lineno] + '\n');
        source.push(mjt.bless(['</pre>\n<pre>']));

        cx = [];
        for (line = lineno+1; line < lines.length; line++)
            cx.push(lines[line]);
        source.push(cx.join('\n'));
        source.push(mjt.bless(['</pre>\n']));

    }

    var html = [mjt.bless(['<div class="mjt_error"']),
                (target_id ? [mjt.bless([' id="']), target_id, mjt.bless(['"'])]
                   : []),
                mjt.bless(['>']),
                e.name, ': ',
                e.message,
                source,
                mjt.bless(['</div>\n'])
                ];
    html =  html.concat(source);
    return html;
};

/**
 *
 *  @constructor
 *  @class mjt.Codeblock is a wrapper around eval() that
 *   allows better debugging of the evaluated code.
 *   mjt does lots of run-time code generation, and
 *   most javascript runtimes are very bad at tracking
 *   eval source code.
 */
mjt.Codeblock = function (name, codestr) {
    this.name = name;
    this.codestr = codestr;
    this.basefile = null;
    this.baseline = null;
};

/**
 *  it is expected that the error will be re-thrown after
 *   calling this function.
 *
 */
mjt.Codeblock.prototype.handle_exception = function (msg, e) {

    // if a codeblock closer to the error already saw this,
    //  bail (we could print more of the stack here)
    if (typeof e.mjt_error != 'undefined')
        return;

    // map Safari exception properties to Firefox names
    var safari = false;
    if (typeof e.sourceURL != 'undefined') { e.fileName   = e.sourceURL; } // is this used?
    if (typeof e.line      != 'undefined') {
        safari=true; // safari gives correct line numbers inside eval - basefile not required
        e.lineNumber = e.line;
    }

    // hang the extra info off the error object for handlers upstack

    if (!(e instanceof Error)) {
        e.mjt_error = {
            name: 'Unknown exception',
            fileName: '',
            message: ''+e
        };
    } else {
        e.mjt_error = {
            fileName: e.fileName,
            lineNumber: e.lineNumber,
            name: e.name,
            message: e.message,
            stack: e.stack, // firefox only?
            rhinoException: e.rhinoException // rhino only
        };
    }


    if (!this.basefile && !safari) {
    } else if (typeof e.stack == 'string') {
        // log error info about the deepest generated stackframe
        //  even if the error occurred in a deeper call
        var filerx = this.basefile.replace(/(\W)/g, '\\$1') + ':(\\d+)\n';
        filerx = new RegExp(filerx);

        var m = filerx.exec(e.stack);
        if (m) {
            var lineno = parseInt(m[1]) - this.baseline;
            if (lineno > 0)
                this.log_error_context(msg, e, lineno);
        }
    } else if (e.fileName == this.basefile || safari) {
        // if no stack, we only show context if the exception
        //  was within generated code (since that's the only
        //  frame we have a line number for).
        // try to guess if this is from a codeblock eval

        var lineno;
        if (safari) { lineno = e.lineNumber - 1;             }
        else        { lineno = e.lineNumber - this.baseline; } // Firefox
        if (lineno > 0) {
            e.mjt_error.lineNumber =  lineno;
            e.mjt_error.fileName =  '<generated code>';
            this.log_error_context(msg, e, lineno);
        }
    }

};

mjt.Codeblock.prototype.log_error_context = function (msg, e, lineno) {
    var cx = this.extract_context(this.codestr, lineno, 5);

    var pfx = '---' + lineno + '-->  ';
    var spc = [];
    for (var i = 0; i < pfx.length; i++)
        spc.push(' ');
    spc = spc.join('');

    var cxtext = [spc, cx.prev_lines.join('\n'+spc),
                   '\n', pfx, cx.the_line, '\n',
                   spc, cx.next_lines.join('\n'+spc)].join('');

    mjt.error('error', msg,
              '\n    ' + e.name + ': ' + e.message + '\n',
              cxtext);
};

/**
 *
 * extract a particular line from a block of (presumably) source code.
 * the line in question is placed in cx.the_line
 * arrays of the previous and next RADIUS lines are placed in
 *   cx.prev_lines and cx.next_lines respectively.
 * cx is initialized to {} if not passed in.
 * returns cx
 *
 */
mjt.Codeblock.prototype.extract_context = function (codestr, lineno, radius) {
    var source = [];

    var lines = codestr.split('\n');

    if (lineno < 0)
        lineno = 0;
    if (lineno >= lines.length)
        lineno = lines.length - 1;

    var line0 = lineno - radius;
    if (line0 < 0) line0 = 0;

    var prev_lines = [];
    for (line = line0; line < lineno; line++)
        prev_lines.push(lines[line]);

    var the_line = lines[lineno];

    var next_lines = [];
    for (line = lineno+1; line < lines.length && line < lineno + radius; line++)
        next_lines.push(lines[line]);

    return {
        prev_lines: prev_lines,
        the_line: the_line,
        next_lines: next_lines
    };
};

/**
 *
 *
 */
mjt.Codeblock.prototype.evaluate = function () {
    // evaluate the code string, generating a new function object
    // that can be used to instantiate the template as a string of
    // html.

    var t0 = (new Date()).getTime();

    // //@line doesn't seem to work on firefox 1.5?
    // TODO try this to clean up line numbers on firefox
    //  - could use bogus high line number if we're decoding it
    //    ourselves, using the high section as a tag to find the eval src.
    /*
    var codestr = [//     '//@line 100000\n',
                   this.codestr,
                   '\n; var s = { main: main }; s;\n'].join('');
    */

    var code = [this.codestr];


    // add magic for cross-browser eval
    code = ['var __mjt_eval = (function(){',

    //'var x = 1;\n return x;\n',
            this.codestr,

            '})(); __mjt_eval;\n'
           ];

    // final "//@ sourceURL" line tells firebug 1.1 the source code addresss
    //var source_url = 'mjt:///' + this.name;
    //code.push('\n//@ sourceURL=');
    //code.push(source_url);

    var codestr = code.join('');

    //WILL: logging huge multi-line string to console overwhelms the debug output
    //      so we put it in an object. Unfortunately Firebug then ignores newlines
    if (mjt.debug)
        mjt.log('evaluating code ' + this.name, {click_me:'view code', codestr:codestr});

    var result;

    // fireclipse (and firebug 1.1?) have sweeter eval debugging,
    //  so we let any errors past.
    // TODO can we check firebug version?
    if (0 && typeof console != 'undefined' && typeof console.trace == 'function') {
        result = eval(codestr);
    } else if (typeof window == 'undefined' || typeof window.navigator.appName == 'undefined') {
        // rhino + env.js - should have a better check than missing appName!
        result = eval(codestr);
    } else {
        // otherwise do what we can.
        // more suggestions on easier debugging here:
        //  http://www.nabble.com/Partial-solution-to-debugging-eval()-code-t3191584.html
        //  http://www.almaden.ibm.com/cs/people/bartonjj/fireclipse/test/DynLoadTest/WebContent/DynamicJavascriptErrors.htm
        // magic to get the current line number
        try { null(); } catch (e) { this.baseline = e.lineNumber + 2; this.basefile = e.fileName; }
        try {
            result = eval(codestr);
        } catch (e) {
            this.handle_exception('evaluating codeblock '+this.name, e);
            throw e;    // re-throw for other debuggers
        }
    }

    var dt = (new Date()).getTime() - t0;
    mjt.note('evaluated code in ', dt, 'msec, ', codestr.length, 'chars, got ', typeof result);

    return result;
};


//
//  ideally, mjt.Codeblock.prototype.evaluate should be the last
//  function in the file.  this reduces ambiguity with the bizarre
//  eval() linenumbers.
//

})(mjt);

/** template.js **/
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

/**
 *  platform-independent (minimal) runtime system required
 *  by compiled templates.
 *  includes some commonly needed auxillary functions for users.
 * 
 */

(function(mjt){

// BUG http://code.google.com/p/mjt/issues/detail?id=5
//   this is used at runtime by generated onevent= callbacks.
//   see compile.js for the only usage.
// it should go away and the callbacks should be tracked differently.
mjt._eventcb = {};



/**
 *
 * wrap arguments in a dict.  this is useful inside ${...} in mjt
 *  templates, where you can't use {} as an object literal.
 *
 */
mjt.kws = function () {
    var kws = {};
    for (var i = 0; i < arguments.length; i += 2) {
        kws[arguments[i]] = arguments[i+1];
    }
    return kws;
};


/**
 *  this implements the guts of mjt.for= iteration
 *
 *  it handles:
 *    javascript objects and arrays
 *    pseudo-arrays:
 *      js strings
 *      jQuery result sets
 *      html DOM nodelists
 *
 *  it doesn't handle:
 *    js "arguments" objects
 *
 */
mjt.foreach = function(self, items, func) {
    var i,l,r;

    //mjt.log('foreach', typeof items, items, items instanceof Array);

    if ((typeof items == 'string') || (items instanceof Array)
        || (typeof jQuery == 'object' && items instanceof jQuery)) {
        // string, array, or pseudo-array
        l = items.length;
        for (i = 0; i < l; i++) {
            r = func.apply(self, [i, items[i]]);
        }
    } else if (typeof items === 'object') {
        if (typeof document != 'undefined' &&
            typeof items.item != 'undefined' &&
            items.item  === document.childNodes.item) {
            // dom nodelist
            l = items.length;
            for (i = 0; i < l; i++)
                func.apply(self, [i, items.item(i)]);
        } else {
            // plain old js object
            for (i in items)
                if (items.hasOwnProperty(i))
                    func.apply(self, [i, items[i]]);
        }
    }
};


/**
 *
 * @private
 * used internally to delay a mjt.script="ondomready" block
 *
 */
mjt.ondomready = function (f, self) {
    var queue = mjt._ondomready_queue;
    if (mjt._ondomready_timer === null) {
        mjt._ondomready_timer = setTimeout(mjt._ondomready_run, 20);
    }
    // alternating elements of the queue are the method function
    // and the object to call it on.
    // not great but cheaper than wrapping each pair.
    queue.push(f);
    queue.push(self);
};

// could attach these to the ondomready function itself
mjt._ondomready_queue = [];
mjt._ondomready_timer = null;

// setTimeout() callback for handling ondomready
mjt._ondomready_run = function () {
    mjt._ondomready_timer = null;
    var queue = mjt._ondomready_queue;
    mjt._ondomready_queue = [];

    while  (queue.length) {
        var f = queue.shift();
        var self = queue.shift();
        f.apply(self);
    }
};

/**
 *  @private
 *  concatenate markup and escape the given escapetag if present.
 *  this is used for the weird HTML quoting rules in <script>
 *  and <style> tags, where the close-tag is the only thing
 *  that should be quoted.
 *  this is fragile-seeming but works for <script> tags because
 *  "</script>" is only legal JS inside a string and can be
 *  converted to "<\/script>" to avoid closing the tag.
 *  for <style>, we convert </style> to <\/style> similarly,
 *  though it's not clear what the actual behavior will be
 *  there, it should at least stop the tag from being closed.
 */
mjt.cleanup_noquote = function (m, escapetag) {
    var s = mjt.flatten_markup(m);
    // undo html-encoding.  it would be nicer not to do this
    // quoting in the first place, but html-encoding is built
    // deeply into the markup generation process.
    s = s.replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');

    // the only thing we need to quote is the close tag
    // (which may contain whitespace too).
    if (typeof escapetag != 'undefined') {
        var rx = new RegExp('</('+escapetag+'\\s*)>', 'ig');
        s = s.replace(rx, '<\\/$1>');
    }
    return mjt.bless(s);
};

/**
 *
 * @private
 * unused for now...
 *
 * generate a wikilink
 *  this is called when $[] is seen in the input
 *  it should really be part of a standard library
 *
 */
mjt.ref = function (name) {
    var s = ['<a href="view?name=',
             mjt.formquote(name), '">',
             mjt.htmlencode(name), '</a>'
             ].join('');
    return new mjt.Markup(s);
};

/**
 * @constructor
 * @class  A TemplateCall is a runtime template call.
 *   this includes the result of calling mjt.run(),
 *   or any nested ${...} calls to mql.def= template functions.
 *
 *  nested mql.def calls only need a TemplateCall instance
 *   if they contain mjt.task calls, but right now a TemplateCall
 *   is created for every function call.
 *
 *  an instance of TemplateCall is created for each
 *   template function, as a prototype for the calls
 *   to that function.  see tfunc_factory()
 *   for more comments about this.
 *
 */
mjt.TemplateCall = function (raw_tfunc) {
    // make available to template code under "this."
    this.raw_tfunc = raw_tfunc;
    delete this._markup;
};

/**
 *  return the markup list generated by the template call as a
 *  nested, unquoted markup list.  this is extremely fast and
 *  is used when you plan to combine the returned markup with
 *  a bunch of other markup before flattening it later.
 *
 */
mjt.TemplateCall.prototype.toMarkupList = function () {
    return this._markup;
};

/**
 *  returns a string containing the HTML or XML produced
 *  by the template call.
 *
 */
mjt.TemplateCall.prototype.toMarkup = function () {
    return mjt.flatten_markup(this._markup);
};


/**
 *  redraw / redisplay / update the template call's generated markup.
 *  this preserves some state from one tcall to the next.
 *
 *  XXX this depends on 'document' and should move out of this file
 *
 */
mjt.TemplateCall.prototype.redisplay = function () {
    var tfunc = this.this_tfunc;

    //mjt.log('redisplay ', tfunc.prototype.signature, this);

    var tcall = new tfunc();
    tcall.prev_tcall = this;
    tcall.subst_id = this.subst_id;
    tcall.render(this.targs).display();
    return tcall;
};


/**
 *  paste the output of a rendered TemplateCall into the DOM
 *
 *  XXX this depends on 'document' and should move out of this file
 *  and be combined with mjt.replace_html.
 *
 */
mjt.TemplateCall.prototype.display = function (target_id) {
    // acre has no live dom
    if (typeof acre != 'undefined')
        return this;

    if (typeof target_id != 'undefined')
        this.subst_id = target_id;

    //mjt.log('display tf', this.signature, this.subst_id);

    var top = this.subst_id;

    if (typeof(top) == 'string') {
        var e = document.getElementById(top);
        if (!e) {
            mjt.note('no element with id ' + top);
            return null;
        } else {
            top = e;
        }
    }

    // special handling if top is an iframe: write into
    // the document body inside the iframe rather than 
    // the iframe tag itself.
    if (top.nodeName == 'IFRAME') {
        var idoc = (top.contentWindow || top.contentDocument);
        if (idoc.document)
            idoc = idoc.document;

        top = idoc.getElementsByTagName('body')[0];
    }

    if (!top) {
        //mjt.log('missing top ', this.subst_id, this);

        // fail silently - this often happens if the user hits
        // reload before the page has completed.
        return this;
    }

    if (typeof this._markup != 'undefined')
        mjt.replace_html(top, this);
    return this;
};


/**
 * call a compiled template function with the given arguments.
 *
 * the template function came from user code, so trap any
 * exceptions it comes up with
 *
 */
mjt.TemplateCall.prototype.render = function(targs) {
    var html;

    if (typeof targs != 'undefined')
        this.targs = targs;

    var raw_tfunc = this.raw_tfunc;

    // if we're running under rhino, skip the try...catch because
    //  rhino will trash our stack trace.
    // see https://bugzilla.mozilla.org/show_bug.cgi?id=363543
    if (typeof window == 'undefined' || typeof window.navigator.appName == 'undefined') {
        this._markup = raw_tfunc.apply(this, this.targs);
        return this;
    }

    // otherwise, we're in the browser, so try to get a better
    // error log message...
    try {
        this._markup = raw_tfunc.apply(this, this.targs);
    } catch (e) {
        e.tcall = this;

        // if the template has a codeblock we may be able to
        // print some debug info.
        var codeblock = this.tpackage._codeblock;

        if (codeblock === null) {
            // if you have been led to this code by a rhino error message,
            // you're out of luck.  the actual error probably occurred
            // within the raw_tfunc.apply(...) call, take a closer
            // look at the exc object and print the data you find there,
            // particularly exc.
            //
            // see https://bugzilla.mozilla.org/show_bug.cgi?id=363543
            throw e;
        }

        codeblock.handle_exception('applying tfunc '+ this.signature, e);

        var tstates = [];
        for (var t in this.tasks) {
            var tt = this.tasks[t];
            if (typeof tt === 'object' && tt !== null) {
                tstates.push(t + ':' + tt.state);
            } else {
                tstates.push(t + ':' + typeof tt);
            }
        }
        this._markup = new mjt.MarkupList(
                mjt.bless('<h3>error applying '),
                this.signature,
                ' to id=', this.subst_id,
                mjt.bless('</h3>'),
                'states:[',
                tstates.join(' '),
                ']');

        // re-throw the exception so other debuggers get a chance at it
        // if you have been led to this code by a rhino error message,
        // you're out of luck.  the actual error probably occurred
        // within the raw_tfunc.apply(...) call.
        //
        // see https://bugzilla.mozilla.org/show_bug.cgi?id=363543
        throw e;
    }
    return this;
};

/**
 *
 *  make a TemplateCall depend on a Task, so that changes
 *   in the Task state will cause redisplay of the template call.
 *  this is used to implement <div mjt.task="...">
 *
 *  if the mjt.Task library is not present this should
 *  never be executed.
 *
 *  XXX this depends on 'document' and should move out of this file
 *
 */
mjt.TemplateCall.prototype.mktask = function(name, task) {
    this.tasks[name] = task;
    var tcall = this;  // because "this" is wrong in closure

    // normally we warn if enqueue() is called twice, but
    // it's common in mjt templates where the enqueue()
    // is implicit.  so we avoid the warning here.
    if (task.state == 'init')
        task.enqueue();

    // trigger the redraw whenever the task is done
    return task.ondone(function () {
        // right now all events are fired synchronously -
        // this is wasteful - if we depend on more than one
        // query and they arrive together we will fire twice, etc.
        tcall.render().display();
    });
};




//////////////////////////////////////////////////////////////////////

/**
 *
 *  the public name for a tfunc is actually a call
 *   to this wrapper.  this is because
 *  a function created using mjt.def="tfunc(...)" needs to be
 *    called in several ways:
 *
 *   - within markup using ${tfunc(...)}
 *   - internally using new() to set up the __proto__ link.
 *   - recursively in order to hide the differences between those cases
 *
 *  not implemented yet:
 *    a template call may not actually need to construct
 *      an object.  this code tries to construct a new instance if
 *      the tfunc contains any mjt.task= declarations - in that case
 *      need a place to keep track of state while waiting for the task.
 *
 *    if we dont need a new instance we just use the TemplateCall
 *      instance.
 *
 *  @param signature  is a debugging name for the template function
 *  @param rawtfunc   is a function that returns markup
 *  @param tpackage   is the TemplatePackage where rawtfunc was defined
 *  @param has_tasks  is true if rawtfunc included mjt.Task declarations
 *  @param toplevel   is true if rawtfunc has top-level scope
 *
 */
mjt.tfunc_factory = function (signature, rawtfunc, tpackage, has_tasks, toplevel) {

    var _inline_tcall = function () {  // varargs
        var ctor = arguments.callee;  // _inline_tcall

        //mjt.log('calling ' + signature);
        if (this instanceof ctor) {
            // this is filled in by running the tcall
            this.tasks = {};
            this.exports = {};

            // XXX this is an alias for backwards-compatibility
            // it should be removed after dev/19 is in production
            this.defs = this.exports;
            if (typeof mjt.deprecate == 'function')
                mjt.deprecate(this, 'defs', '.exports');

            // when called as a constructor, we create the template call
            //  object but dont actually expand it yet.
            //mjt.log(signature + ' called as constructor');
            return undefined;
        }

        // called as a plain function, presumably from ${ctor(...)}

        // if this is a lightweight call (no need for redisplays)
        //  then we just bind the TemplateCall as "this" rather than
        //  creating a new instance, and run it.
        // also make sure we dont need this.exports (for _main() )

        // TODO for performance, should be able to omit
        // TemplateCall construction in this case
        if (0 && !ctor.prototype.has_tasks && !toplevel) {
            return rawtfunc.apply(ctor.prototype, arguments);
        }

        // if we werent called as a constructor, re-invoke
        //   ourselves that way to create an object.
        var self = new ctor();

        // copy arguments array
        var targs = [];
        for (var ai = 0; ai < arguments.length; ai++)
            targs[ai] = arguments[ai];

        // if we're called inline, generate a subst_id
        var tname = self.signature.replace(/\(.*\)$/,'');

        // only set up subst_id if the mjt.def contains tasks.
        // otherwise we suppress id= generation
        if (ctor.prototype.has_tasks)
            self.subst_id = mjt.uniqueid('tcall__' + tname);
        else
            self.subst_id = null;


        // update the generated markup
        // this is done eagerly so that the state is more predictable,
        //  but lazy update (on display rather than eval) would save
        //  computation in some cases.
        self.render(targs);

        // make arguments available to template code under "this."
        // self.stackframe = mjt.reify_arguments(self.signature, targs);

        // since werent called using new(), return this explicitly.
        // this means the template call object gets mixed into the
        // output stream, so it must have a .toMarkup() method...
        return self;
    };

    // provides this.raw_tfunc, the raw template expansion function
    _inline_tcall.prototype = new mjt.TemplateCall(rawtfunc);

    _inline_tcall.prototype.signature = signature;
    _inline_tcall.prototype.tpackage = tpackage;
    _inline_tcall.prototype.has_tasks = has_tasks;

    _inline_tcall.prototype.source_microdata = rawtfunc.source_microdata;

    // this_tfunc is the constructor rather than the raw expansion code
    _inline_tcall.prototype.this_tfunc = _inline_tcall;

    return _inline_tcall;
};


})(mjt);

/** linker.js **/
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


/**
 *   most of this should become "package.js" since is
 *   the TemplatePackage implementation.
 * 
 */

(function(mjt){

/**
 *
 * @constructor
 * @class a TemplatePackage is a namespace of template functions,
 * usually loaded from a single html document.
 * 
 * there are several ways to get Template
 * 
 * it is common to refer to a loaded TemplatePackage through the
 * namespace it defines.  this is a js object whose properties
 * contain the top-level defs from a template file.  it is accessible
 * inside a template file under the name "exports".
 * 
 * to find the TemplatePackage associated with a compiled namespace
 * "exports", use "exports._main.prototype.tpackage".
 *
 * @param name  is used for debugging only right now
 * @param stringtable  is the array of literal strings used by the template
 * @param code  contains the code to build the template, as a string or as a function.
 */
mjt.TemplatePackage = function () {
    // source url or other string for debug logging
    // put in a mjt.Resource?
    this.source = null;

    // list of strings used by the generated template code.
    // this is used to generate source code - for runtime speed
    // all the entries here are pre-wrapped as markup and cached
    // in this._template_fragments.
    this._template_strings = null;

    // compiled and evaluated js template functions
    this._compiled = null;

    // source code for the template, if it was provided as a string.
    // otherwise null if the template was loaded from a js file rather
    // than built from source or loaded from a string.
    this._codeblock = null;

    // optional debug info mapping js line number to template source location
    this.debug_locs = null;

    // output mode specified in the template, may be 'text' 'html' 'xml'
    this.output_mode = null;

    // runtime data

    // markup for template fragments
    this._template_fragments = null;

    // namespace will contain at least '_main'
    //  and possibly other toplevel mjt.defs.
    // it is populated by evaluating _codeblock to build
    //  a function and evaluating that function to build
    //  the package's toplevel namespace.
    this.namespace = null;
};

// functions exported to template code
mjt.TemplatePackage.prototype.runtime = {
    _break_token: mjt._break_token,
    _continue_token: mjt._continue_token,
    bless: mjt.bless,
    cleanup_noquote: mjt.cleanup_noquote,
    foreach: mjt.foreach,
    htmlencode: mjt.htmlencode,
    make_attr_safe: mjt.make_attr_safe,
    new_markuplist: function () { return new mjt.MarkupList() },
    ondomready: mjt.ondomready,
    ref: mjt.ref,
    tfunc_factory: mjt.tfunc_factory,
    uniqueid: mjt.uniqueid
};



// called internally to do the initialization once more template info is available
mjt.TemplatePackage.prototype.init_from_json = function (info) {
    if (typeof info.file != 'undefined')
        this.source = info.file;

    if (typeof info.stringtable != 'undefined')
        this._template_strings = info.stringtable;

    // source code for the template, if it was provided as a string.
    // otherwise null if the template was loaded from a js file rather
    // than built from source or loaded from a string.
    this._codeblock = null;

    if (typeof info.code == 'string') {
        this._codeblock = new mjt.Codeblock(this.source, info.code);
    } else if (typeof info.code == 'function') {
        // if the template was precompiled, we have a closure that
        // renders the main template.
        this._compiled = info.code;
    }

    if (typeof info.debug_locs != 'undefined')
        this.debug_locs = info.debug_locs;

    if (typeof info.output_mode != 'undefined')
        this.output_mode = info.output_mode;

    return this;
};

// code comes before metadata to avoid disturbing line numbers when using
// this method as a prefix
mjt.TemplatePackage.prototype.init_from_js = function (obj) {
    var code = obj.def;
    var info = obj.info;
    this.init_from_json(info);
    this._compiled = code;
    return this;
};

mjt.TemplatePackage.prototype.get_metadata = function () {
    var pkgjson = {
        file: this.source,
        stringtable: this._template_strings,
        debug_locs: this.debug_locs,
        output_mode: this.output_mode
    };
    return pkgjson;
};

mjt.TemplatePackage.prototype.toJSON = function () {
    var pkgjson = this.get_metadata();
    if (this._codeblock === null) {
        mjt.warn('TemplatePackage.toJSON: complete source code unavailable', this.source);
        pkgjson.code = this._compiled;
    } else {
        pkgjson.code = this._codeblock.codestr;
    }

    return JSON.stringify(pkgjson);
};

/**
 * output the template package in a format that can be
 * evaluated as javascript to return a new TemplatePackage.
 * the difference between this and toJSON() is that the
 * compiled template code is serialized as a javascript function
 * declaration rather than as a string.
 *
 * a new template package can be created from this js using:
 *  var pkg = (new mjt.TemplatePackage()).init_from_js(jsobj);
 * 
 */
mjt.TemplatePackage.prototype.toJS = function (strip) {
    var codestr = null;
    if (this._codeblock === null) {
        mjt.warn('TemplatePackage.toJS: complete source code unavailable', this.source);
        codestr = this._compiled;
    } else {
        codestr = '(function () {' + this._codeblock.codestr + '})()';
    }

    // note prefix does not include newlines so line numbers are undisturbed
    // this object can be turned into a package using TemplatePackage.init_from_js()
    var strs = ['{def: ', codestr,
                ',\ninfo:', JSON.stringify(this.get_metadata()),
                '}\n'
               ];
    return strs.join('');
};

/**
 * look up the template source line number from the generated
 * js line number, if we have debug_locs
 * 
 */
mjt.TemplatePackage.prototype.lookup_line = function (js_lineno) {
    if (!(debug_locs instanceof Array) || js_lineno >= this.debug_locs.length)
        return null;
    return this.debug_locs[js_lineno-1];
};


/**
 * compiles the package to a js codeblock.
 *   the codeblock defines one function "rawmain" which runs the toplevel template
 *   and defines any internal mjt.defs.
 * all prereqs must already be present.
 * top is a DOM node.
 */
mjt.TemplatePackage.prototype.compile_document = function (top, compiler) {

    var t0 = (new Date()).getTime();

    if (typeof compiler == 'undefined')
        compiler = new mjt.TemplateCompiler();

    // set additional options here...

    compiler.compile_top(top, 'rawmain()');
    var dt = (new Date()).getTime() - t0;
    // restore this as a debug message at some point
    //mjt.note('template compiled in ', dt, 'msec from ', this.source);

    var info = { source: this.source,
                 stringtable: compiler.strings,
                 code: (compiler.codestr + '; return rawmain;'),
                 debug_locs: compiler.debug_locs,
                 output_mode: compiler.output_mode
               };
    return this.init_from_json(info);
}


/**
 * compiles and evaluates the package.
 * all prereqs must already be present.
 *
 * returns the evaluated toplevel.
 */
mjt.TemplatePackage.prototype.load_document = function (top, targs) {
    this.source += '#' + top.id,
    this.compile_document(top);
    return this.load(targs);
};

/**
 *  get the template namespace for a TemplatePackage
 * 
 *  the namespace is built if the template is not fully loaded yet.
 * 
 *  user code should probably use this instead of TemplatePackage.load()
 *
 */
mjt.TemplatePackage.prototype.toplevel = function (targs) {
    if (this.namespace === null)
        this.load(targs);
    return this.namespace;
};

/**
 *  return the generated markup string from a template package.
 */
mjt.TemplatePackage.prototype.toString = function () {
    if (this.namespace === null)
        this.load(targs);

    return mjt.flatten_markup(this.namespace._main.prototype.tpackage.tcall);
};

/**
 *  finish loading a TemplatePackage, so it is ready for use.
 *
 *  the package should already be compiled.
 *  evaluate the javascript source code for the template package if needed.
 *  run the template code to generate the toplevel TemplateCall.
 *  pull out the toplevel namespace from the TemplateCall.
 *
 *  XXX rename this
 */
mjt.TemplatePackage.prototype.load = function (targs) {
    // pre-bless everything in the string table
    this._template_fragments = [];
    for (var tsi = 0; tsi < this._template_strings.length; tsi++)
        this._template_fragments[tsi] = mjt.bless(this._template_strings[tsi]);

    // evaluate the code string if needed
    if (this._compiled === null) {
        if (this._codeblock === null) {
            mjt.error('TemplatePackage has no code', this.source);
        } else {
            // evaluate the code string, generating a raw function for
            // the toplevel template.
            this._compiled = this._codeblock.evaluate();
        }
    }

    if (typeof targs == 'undefined')
        targs = [];
    this._args = targs;

    // build a template function object around the raw code
    var mainfunc = mjt.tfunc_factory("_main()", this._compiled,
                                     this, false, true);

    // create the top-level TemplateCall for main(), and render 
    // it to create the toplevel mjt.def= definitions and 
    // any toplevel markup.
    var tcall = new mainfunc();
    tcall.render(this._args);

    this.tcall = tcall;
    tcall.pkg = this;
    if (typeof this._compiled.doc_content_type != 'undefined')
        tcall.doc_content_type = this._compiled.doc_content_type;

    if (typeof tcall.exports._main != 'undefined') {
        throw new Error("_main() is illegal as a template function name");
    }

    this.namespace = tcall.exports;
    this.namespace._main = mainfunc;

    // TODO remove this once all references to main are removed
    // from user templates
    if (typeof tcall.exports.main != 'undefined') {
        throw new Error("main() is illegal as a template function name");
    }
    this.namespace.main = mainfunc;
    if (typeof mjt.deprecate == 'function')
         mjt.deprecate(this.namespace, 'main', '._main');

    // end TODO

    return this;
};
})(mjt);

/** runtime.js **/
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

/**
 *  mjt functions to make use of compiled templates.
 *  most of these are browser-specific and not part of the minimal runtime.
 *  
 */

(function(mjt){

/**
 *
 * walk the html dom, extracting mjt.* attributes, recording
 *   and compiling templates, queries, and template insertion sites.
 *
 */
mjt.run = function (target, tfunc, targs) {
    //mjt.log('mjt.run', target, tfunc, targs);
    var target_id;

    // there is always a single app
    if (typeof mjt.app == 'undefined') {
        mjt.app = new mjt.App();
    }

    // special case for mjt.run() with no arguments
    if (arguments.length == 0) {
        var pkg = new mjt.TemplatePackage();
        return mjt.run_page(pkg);
    }

    // look up first arg as a string (element id) or a dom element object.
    if (typeof target === null) {
        throw new Error ('mjt.run: null target');
    } else if (typeof target == 'string') {
        target_id = target;
        target = document.getElementById(target_id);
    } else if (typeof target == 'object') {
        //mjt.log('mjt.run id ', typeof target.id, target_id, target);
        if (target.id == '')
            target.id = mjt.uniqueid('run_target');
        target_id = target.id;
    }

    if (arguments.length == 1) {
        var pkg = new mjt.TemplatePackage();
        pkg.source = window.location.protocol + '//'
            + window.location.host + window.location.pathname
            + '#' + target_id;
        return mjt.run_element(pkg, target, targs);
    }

    if (typeof tfunc !== 'function') {
        mjt.error('invalid template function', tfunc, arguments);
        throw new Error('mjt.run: invalid args');
    }

    // create a templatecall object and run the template function
    var tcall = new tfunc();
    tcall.subst_id = target_id;
    tcall.render(targs).display();
    return tcall.exports;
};

/**
 *
 * load template metadata from a dom document.
 * the metadata is encoded inside the html <head> element.
 *
 */
var load_page_metadata = function (pkg, head) {
    var elts = [];
    var e;
    for (e = head.firstChild; e !== null; e = e.nextSibling) {
        if (e.nodeType != 1)
            continue;
        // nodeType == NODE
        elts.push(e);
    }

    for (var i = 0; i < elts.length; i++) {
        e = elts[i];
        switch (e.nodeName) {
          case 'TITLE':
            pkg.title = e.innerHTML;
            break;

          case 'META':
            //d.push({ name: e.name, content: e.content, http_equiv: e.httpEquiv });
            switch (e.name) {
              case 'description':
                pkg.summary = e.content;
                break;
              case 'author':
                pkg.author = e.content;
                break;
              case 'content-language':
                pkg.language = e.content;
                break;
              case 'x-mjt-id':
                pkg.id = e.content;
                break;
            }
            break;

          case 'SCRIPT':
            // skip this, its already been evaluated by the browser
            //d.push({ type: e.type, src: e.src, text: e.text });
            break;

          case 'STYLE':
            //d.push({ media: e.media,  type: e.type, innerHTML: e.innerHTML });
            break;

/*
          case 'LINK':
            //d.push({ rel: e.rel, href: e.href, type: e.type, title: e.title, id: e.id });
            switch (e.rel) {
              case 'x-mjt-script':
                require_package('js', e.href, e.title,
                             (e.type || 'text/javascript'));
                break;
              case 'x-mjt-import':
                require_package('mjt', e.href, e.title,
                             (e.type || 'text/x-metaweb-mjt'));
                break;
              case 'stylesheet':
              case 'alternate stylesheet':
                break;
            }
            break;
*/

          default:
            break;
        }
    }
};

/*
 *  support the special case of mjt.run() with no arguments.
 *  extracts package metadata from the <head> tag
 *  moves the contents of <body> into a separate <div> for compilation
 *
 *  @returns DomElement  the <div> element holding the template source.
 */
mjt.run_page = function (pkg) {
    //   get package metadata from <head>
    //   extract the <body>

    // get package metadata from this page's <head>
    load_page_metadata(pkg, document.getElementsByTagName('head')[0]);

    // XXX add any prereqs here too
    var prereq_task = mjt.Succeed();

    pkg.source = window.location.protocol + '//'
        + window.location.host + window.location.pathname;
    // pull the template contents of <body> into a subdiv
    var target = document.createElement('div');

    var body = document.getElementsByTagName('body')[0];
    var e = body.firstChild;
    while (e !== null) {
        var tmp = e;
        e = e.nextSibling;

        // while compiling the body, sometimes we run into
        // iframes that were created to load external resources
        // rather than being part of the source code.  ignore them.
        if (tmp.nodeName === 'IFRAME'
            && tmp.className === 'mjt_dynamic') {
            continue;
        }

        body.removeChild(tmp);
        target.appendChild(tmp);
    }

    // TODO can this be removed if we refer to target by
    //  element rather than by id?
    if (1) {
        target.id = mjt.uniqueid('mjt_body');
        target.style.display = 'none';
        body.appendChild(target);
    }

    // strip off any display='none' on <body>
    if (body.style.display == 'none')
        body.style.display = '';

    // run the toplevel element after all prereqs are ready
    prereq_task.enqueue()
        .onready(function (r) {
            mjt.run_element(pkg, target, []);
         });
    return pkg.namespace;
};

/*
 *  compile a template from a dom node, run it, and display the result.
 *
 *  compile the template from the dom to javascript and run it
 *  paste the resulting html back into the dom
 *
 *  @param pkg    TemplatePackage    template package
 *  @param target DomElement         dom node containing the template source
 *  @param targs  Array              arguments passed to the generated template function
 *
 */
mjt.run_element = function (pkg, target, targs) {
    pkg.load_document(target, targs);

    pkg.tcall.subst_id = target.id;
    //mjt.log('mjt.run compiled', target_id);
    pkg.tcall.display();
    
    // set a variable in the containing scope - this
    // will only make a difference if pkg.load_document is
    // called synchronously.
    return pkg.tcall.exports;
};

/**
 *
 * walk the html dom, extracting mjt.* attributes, recording
 *   and compiling templates, queries, and template insertion sites.
 *
 */
mjt.load_element = function (top) {
    //mjt.log('mjt.load', top);

    var topelt = typeof top == 'string' ? document.getElementById(top) : top;

    var pkg = new mjt.TemplatePackage();
    pkg.source = window.location.protocol + '//'
        + window.location.host + window.location.pathname;
    if (typeof top == 'string')
        pkg.source += '#' + top;

    pkg.load_document(topelt, []);

    return pkg;
};

/*
 * compile and load a mjt template from an iframe.
 * 
 * this assumes the IFRAME is already loaded, i.e. it is safe to call
 * mjt.load_from_iframe() inside a body.onload handler iff the iframe is
 * declared in the original HTML.  dynamically generated iframes must wait for
 * the load to complete before calling mjt.load_from_iframe.
 * 
 * top is an iframe element or a string containing the id of
 * an iframe element.
 */
mjt.load_from_iframe = function (top) {
    var pkg = new mjt.TemplatePackage();

    // XXX this should be the src of the iframe instead
    pkg.source = window.location.protocol + '//'
        + window.location.host + window.location.pathname;

    var topelt = top;
    if (typeof top == 'string')
        topelt = document.getElementById(top);

    if (topelt.nodeName != 'IFRAME') {
        mjt.error('called mjt.load_from_iframe on node tag', topelt.nodeName);
        return null;
    }

    var idoc = topelt.contentWindow || topelt.contentDocument;
    if (idoc.document)
        idoc = idoc.document;

    topelt = idoc.getElementsByTagName('body')[0];

    // XXX should this call load_page_metadata() and set up dependencies?

    pkg.load_document(topelt, []);

    return pkg.namespace;
};

/**
 *
 * compile a mjt string.  returns the TemplatePackage.
 *
 */
mjt.load_string = function (mjthtml) {
    // note that the tag is never inserted into the document
    var tag = document.createElement('div');
    tag.innerHTML = mjthtml;
    return mjt.load_element(tag);
};


//////////////////////////////////////////////////////////////////////


/**
 *
 *
 */
mjt.replace_html = function (top, html) {
    var tmpdiv = document.createElement('div');
    var htmltext = mjt.flatten_markup(html);
    tmpdiv.innerHTML = htmltext;

    //mjt.log(htmltext);

    if (top.parentNode === null) {
        mjt.warn('attempt to replace html that has already been replaced?');
        return;
    }

    var newtop = tmpdiv.firstChild;

    if (newtop === null) {
        // should quote the htmltext and insert that?
        mjt.warn('bad html in replace_innerhtml');
        return;
    }

    //mjt.log('replacetop', newtop, top);
    if (newtop.nextSibling) {
        mjt.warn('template output should have a single toplevel node');

        // best effort: this means we must introduce an extra <div> to hold
        // the multiple results from the template...
        newtop = tmpdiv;
    }

    // XXX can we use jquery for this?  needed to avoid IE memory leaks
    // XXX should use jquery: $(top).empty();
    //mjt.teardown_dom_sibs(top, true);

    top.parentNode.replaceChild(newtop, top);

    // this is kind of unusual behavior, but it's hard to figure
    // out where else to do it.
    if (newtop.style && newtop.style.display == 'none')
        newtop.style.display = '';    // to use default or css style
};


})(mjt);

/** compile.js **/
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


/**
 *  compile.js - compile a mjt.TemplatePackage from a DOM representation.
 * 
 * The TemplateCompiler object keeps the state of the translation.
 * You can get the code out of it afterwards from the "codestr" property.
 * The generated code looks roughly like this:
 * 
 *     var rawmain = function(){
 *         ...
 *     };
 * 
 * the rawmain function can be used to construct a mjt.TemplatePackage object.
 * 
 * this is a pretty simple single-pass compiler.
 * it is mostly standalone - it requires the following from the mjt
 * runtime though some of these will become parameters.
 *   mjt.debug
 *   mjt.warn() mjt.log() mjt.error()
 * 
 * the compiler keeps a stack of Scope objects, one for each enclosing
 * mjt.def= declaration.  the top-level Scope is annotated with the
 * name of the toplevel generated function ("rawmain()").  the toplevel
 * namespace is handled differently so that toplevel mjt.def= declarations
 * can be exported nicely.
 *
 * there are two output streams, one for markup and one for code.
 * the markup stream is temporary and so that sequential markup writes
 * can be collapsed to a single line of code.
 *
 * the generated code only makes use of the TemplatePackage.runtime
 * entry points, so it does not depend on the "mjt" toplevel symbol.
 *
 * the exception is _mjt.eventcb which is only used browser-side.
 * this is referenced within event handlers so the __pkg.runtime
 * interface is not available.
 */

(function(mjt){

/**
 *
 *  @constructor
 *  @class mjt.Scope holds a stack of mjt.def= definitions.
 *
 */
mjt.Scope = function(template, parent, decl) {
    this.template = template;
    if (!parent) parent = null;
    this.parent = parent;

    if (!decl) decl = '[unnamed]';
    this.decl = decl;

    this.tasks = {};

    this.toplevel = false;

    // possibly this should be on Compiler instead of Scope?

    // a stack of open microdata items
    this.microdata = {
        items: {},       // all items indexed by id= attribute
        item: null,      // the currently open item
        stack: [],       // containing items
        lastvalue: null  // the value - used to store last subvalue when building
    };

    // there is only one items dictionary per compiler.
    if (parent !== null)
        this.microdata.items = parent.microdata.items;
};

/**
 *
 *  @constructor
 *  @class holds the state of a Template compiler, which compiles a DOM to Javascript.
 *
 * @param top  DomElement  the parsed markup element
 *
 * most of this class will break out into TemplateCompiler.
 * the remainder moves to TemplatePackage.
 */

mjt.TemplateCompiler = function () {

    // template fragment strings.
    // these get copied into TemplatePackage._tstrings
    this.strings = [];

    // codestr gets copied into TemplatePackage._codestr
    this.codestr = null;

    // maps js line numbers to template source code locations
    this.debug_locs = [];

    // this is the compiler state
    this.source_loc = null;
    this.compiler_dt = null;
    this._markup = [];
    this._code = [];

    this.next_unique_id = {};

    this.debug = mjt.debug;

    // this distinguishes browser-side from server-side mjt
    this.browser_dom = (typeof navigator != 'undefined');

    // later this will choose between compiling to run in a browser
    // vs. compiling to run on the server.
    this.browser_target = true;

    // this holds the <?xml?> processing instruction if desired
    this.output_prefix = null;

    // this may be overridden by a template
    this.document_content_type = null;

    // set the output mode to html by default
    this.set_output_mode('html');

    // look for both mjt. tags
    // and mjt: tags
    // should really be more xml namespace aware though -
    //  this counts on people bringing in the namespaces with xmlns:mjt
    this.mjtns_re = /^(?:mjt\.|mjt:|acre:)(.+)$/;

    // capability check
    this._ie_attribute_bs = this.browser_dom && /MSIE/.test(navigator.userAgent);
};

/**
 * set the output mode for the compiled template.
 * choices are 'html' and 'xml'
 */
mjt.TemplateCompiler.prototype.set_output_mode = function(mode) {
    this.output_mode = mode;

    this.empty_tags = {};
    this.boolean_attrs = {};
    this.preserve_space_tags = {};
    this.noescape_tags = {};

    switch (mode) {
      case 'text':
        break;

      case 'xml':
        // no special tag handling for xml
        break;

      case 'html':
        // self-closing tags
        this.empty_tags = { area:1, base:1, basefont:1, br:1, col:1, frame:1,
                            hr:1, img:1, input:1, isindex:1, link:1, meta:1, param:1
        };
        // attributes that should not have  ="..."
        this.boolean_attrs = {
            selected:1, checked:1, compact:1, declare:1,
            defer:1, disabled:1, ismap:1, multiple:1,
            nohref:1, noresize:1, noshade:1, nowrap:1
        };

        // whitespace-sensitive contents
        this.preserve_space_tags = {
            pre:1, textarea:1
        };

        // don't html-encode contents
        this.noescape_tags = {
            script:1,
            style:1
        };
        break;

      default:
        throw new Error('set_output_mode: unknown mode "' + mode + '"');
        break;
    }
};

/**
 *
 * compile the template
 *
 */
mjt.TemplateCompiler.prototype.compile_top = function(top, toplevel_def) {
    // set up the toplevel scope
    this.scope = new mjt.Scope(this, null, '[toplevel]');
    this.scope.toplevel = true;
    this.scope.toplevel_def = toplevel_def;

    this.compile_node(top);
    
    this.codestr = this._code.join('');
    this._code = null;   // for gc
    this._markup = null;   // for gc

    if (this.codestr == '') {
        // this isn't necessarily an error, but usually indicates
        // a problem in the compiler.
        throw new Error('template compiled with no output');
    }
};


/**
 *  
 */
mjt.TemplateCompiler.prototype.uniqueid = function (prefix) {
    var id = this.next_unique_id[prefix];
    if (typeof id !== 'number')
        id = 1;
    this.next_unique_id[prefix] = id + 1;
    return prefix + '_' + id;
};

mjt.TemplateCompiler.prototype._ampRE = /\&/g;
mjt.TemplateCompiler.prototype._ltRE = /\</g;
mjt.TemplateCompiler.prototype._gtRE = /\>/g;

/**
 *
 * escape <>& characters with html entities.
 *
 */
mjt.TemplateCompiler.prototype.htmlencode = function (s) {
    return s.replace(this._ampRE,'&amp;').replace(this._ltRE,'&lt;').replace(this._gtRE,'&gt;');
};

/**
 *  encode a string for inclusion into javascript code.
 *  e.g.   jsencode("\n")  -->   "\"\\n\""
 */
mjt.TemplateCompiler.prototype.jsencode = function (s) {
    // strictly speaking you can't JSON encode a string, only an object or array.
    // in order to re-use the existing JSON encoder, this code wraps the string
    // in an array and then remove the brackets from the resulting JSON string.
    // this is a hack - the alternative would be to copy the quote()
    // function from json2.js instead of using whatever version of JSON.stringify()
    // is provided.
    return JSON.stringify([s]).replace(/^[^"]*/, '').replace(/[^"]*$/, ''); 
};

/**
 *
 *
 */
mjt.TemplateCompiler.prototype.flush_markup = function(no_output) {
    if (this._markup.length == 0)
        return -1;

    var s = this._markup.join('');
    this._markup = [];

    var texti = this.strings.length;
    this.strings[texti] = s;

    if (this.debug) {
        // generate comments with the text in them

        var indent = '                                                  ';
        var commentstart = '// ';
        var x = s.replace(/\r?\n/gm, '\n' + indent + commentstart);

        var c = '__m[__n++]=__ts[' + texti + '];';
        if (c.length < indent.length)
            c += indent.substr(c.length);
        this.emit(c, commentstart, x, '\n');

    } else if (! no_output) {
        this.emit('__m[__n++]=__ts[', texti, '];\n');
    }

    return texti;
};

/**
 * emit code
 * args are converted to strings and appended to the generated code.
 * the template string buffer is flushed first if needed.
 * this also tracks newlines to maintain a template <-> js line mapping
 */
mjt.TemplateCompiler.prototype.emit = function () {
    // make sure there is no pending markup before we start inserting code
    // note that this will re-enter emit() as part of flushing the markup!
    if (this._markup.length)
        this.flush_markup();

    // handle the arguments one by one
    for (var i = 0; i < arguments.length; i++) {
        var arg = '' + arguments[i];
        // split on newlines so we can count generated lines
        // for the line number mapping.
        var lines = arg.split('\n');
        for (var li = 0; li < lines.length; li++) {
            if (li > 0) {
                this._code.push('\n');
                this.debug_locs.push(this.source_loc);
            }
            this._code.push(lines[li]);
        }
    }
};

/**
 * emit code and append a newline.
 */
mjt.TemplateCompiler.prototype.emitln = function () {
    this.emit.apply(this, arguments);
    this.emit('\n');
};


/**
 * emit strings that will be passed through to the template output unchanged.
 * args are converted to strings and lazily added to the string table.
 */
mjt.TemplateCompiler.prototype.markup = function () {
    for (var i = 0; i < arguments.length; i++) {
        this._markup.push(arguments[i]);
    }
};


/**
 * warn at runtime by adding the warning into the template output
 */
mjt.TemplateCompiler.prototype.warn = function(s) {
    this.markup('<span style="outline-style:solid;color:red;">',
             this.htmlencode(s),
             '</span>');
};


/**
 *
 * compile code to create or reference a mjt task.
 *   the task is only created once, not on each redraw!
 *
 */
mjt.TemplateCompiler.prototype.compile_task = function(taskname, n) {
    // should be an error to have other mjt.* attrs?

    // the query is in the text
    if (n.firstChild === null || n.firstChild.nodeType != 3
        || n.firstChild.nextSibling !== null) {
        throw new Error('mjt.task=' + taskname + ' declaration may only contain text');
    }

    var mq = n.firstChild.nodeValue;
    if (mq.match(/;\s*$/)) {
        mjt.warn('mjt.task=', taskname,
                 'definition should not end with a semicolon');
        mq = mq.replace(/;\s*$/, ''); // but fix it and continue
    }

    if (this.browser_dom && mq.match(/\/\/ /)) {
        // no way to fix this - IE doesnt preserve whitespace
        mjt.warn('"//" comments in mjt.task=', taskname,
                 'definition will fail on IE6');
    }

    // create the Task if it hasn't already been created.
    // in the browser runtime, we could be redrawing an existing template,
    // in which case we must not re-create its tasks.
    // note also that we won't even evaluate the body of the task declaration
    // unless we're actually creating it.
    // "this" in the generated code refers to the TemplateCall object
    this.emitln('var ', taskname, ' = this.tasks && this.tasks.', taskname, ';');
    this.emitln('if (!', taskname, ') { ', taskname, ' = this.mktask("', taskname, '", (\n', mq, ')); }');

    // mark the current function as requiring a TemplateCall to be created at runtime
    this.scope.has_tasks = true;
};

/**
 *
 * compile a text node or attribute value,
 *  looking for $$ or $var or ${expr} and expanding
 *
 *  @param s string            the source text
 *  @param attrtext   boolean  flag indicating that the text is inside an xml attribute
 *  @trim_leading_ws  boolean  flag to ignore whitespace at the start of the text
 *  @trim_trailing_ws boolean  flag to ignore whitespace at the end of the text
 *  @complex_substitutions_only boolean  flag to only allow ${} style substitutions
 */
mjt.TemplateCompiler.prototype.compile_text = function(s, attrtext,
                                                       trim_leading_ws, trim_trailing_ws,
                                                       complex_substitutions_only) {
    var endsimplesub = /[^A-Za-z0-9_.]/gm;
    var closebrace = /\}/gm;
    var closebracket = /\]/gm;
    
    var ret = {
      has_subs : false,
      next_node_leading_ws : null
    };
    
    if (typeof attrtext == 'undefined')
        attrtext = false;

    if (typeof trim_leading_ws == 'undefined')
        trim_leading_ws = false;
    if (typeof trim_trailing_ws == 'undefined')
        trim_trailing_ws = false;
    if (typeof complex_substitutions_only == 'undefined')
        complex_substitutions_only = false;

    // temporaries: match and substring
    var m, ss, nlines;

    var slen = s.length;
    var lasti = 0;
    var si = s.indexOf('$', lasti)

    // fastpath
    if (si == -1) {
        nlines = s.split('\n').length - 1;

        if (trim_leading_ws)
            s = s.replace(/^\s+/m, '');
        if (trim_trailing_ws)
            s = s.replace(/\s+$/m, '');
        
        var re = /\n\s*$/.exec(s);
        if (re) {
            ret.next_node_leading_ws = re[0];
            s = s.substr(0, re.index); 
        }

        this.markup(this.htmlencode(s));
        this.source_loc += nlines;
        return ret;
    }

    while (si >= 0) {
        // pass through anything before the $
        ss = s.substring(lasti, si);

        nlines = ss.split('\n').length - 1;
        if (lasti == 0 && trim_leading_ws)
            ss = ss.replace(/^\s+/m, '');

        this.markup(this.htmlencode(ss));
        this.source_loc += nlines;

        si++;
        if (si >= slen) {
            this.warn('premature end of $ substitution in ' + this.jsencode(s));
            return ret;
        }

        switch (s.charAt(si)) {
          case '$':
            if (complex_substitutions_only) {
                this.markup('$');
                break;
            }
            // "$$" becomes "$"
            si++; // skip the second $
            this.markup('$');
            break;

          case '(':
            // "$(" is always passed through because it's very common in jQuery
            this.markup('$');
            break;

          case '{':
            // "${" starts a complex substitution
            closebrace.lastIndex = si+1;
            m = closebrace.exec(s);
            if (m === null) {
                this.warn('missing close after ${ in ' + this.jsencode(s));
                return ret;
            }
            ss = s.substring(si+1, closebrace.lastIndex-1);
            si = closebrace.lastIndex;

            if (/\{/.test(ss))
                throw new Error('template compiler: "{" and "}" are forbidden inside "${...}"');

            if (attrtext)
                this.emitln('__m[__n++]=__pkg.runtime.make_attr_safe(', ss, ');');
            else
                this.emitln('__m[__n++]=(', ss, ');');
            ret.has_subs = true;
            this.source_loc += ss.split('\n').length - 1;
            break;

          case '[':
            if (complex_substitutions_only) {
                this.markup('$');
                break;
            }

            // "$[" is for wikiref-like behavior
            if (attrtext)
                throw new Error('template compiler: "$[...]" is illegal in an attribute');

            closebracket.lastIndex = si+1;
            m = closebracket.exec(s);
            if (m === null) {
                this.warn('missing close after $[ in ' + this.jsencode(s));
                return ret;
            }
            ss = s.substring(si+1, closebracket.lastIndex-1);
            si = closebracket.lastIndex;

            if (/\[/.test(ss))
                throw new Error('template compiler: "[" and "]" are forbidden inside "$[...]"');

            this.emitln('__m[__n++]=__pkg.runtime.ref(', this.jsencode(ss), ');');
            ret.has_subs = true;
            this.source_loc += ss.split('\n').length - 1;
            break;

          default:
            if (complex_substitutions_only) {
                this.markup('$');
                break;
            }

            // "$" followed by anything in [A-Za-z0-9.] is a simple substitution
            // (an identifier or dot-separated property path)
            endsimplesub.lastIndex = si;
            m = endsimplesub.exec(s);
            if (m === null) {
               ss = s.substring(si);
               si = slen;
            } else if (m.index > si) {
               ss = s.substring(si, m.index);
               si = m.index;
            } else {
                this.warn('unknown character following $ in ' + this.jsencode(s));
                return ret;
            }
            if (attrtext)
                this.emitln('__m[__n++]=__pkg.runtime.make_attr_safe(', ss, ');');
            else
                this.emitln('__m[__n++]=', ss, ';');
            ret.has_subs = true;
        }

        lasti = si;
        si = s.indexOf('$', lasti);
    }
    if (lasti >= 0 && lasti < slen) {
        ss = s.substring(lasti);
        nlines = ss.split('\n').length - 1;

        if (trim_trailing_ws)
            ss = ss.replace(/\s+$/m, '');
        
        var re = /\n\s*$/.exec(ss);
        if (re) {
            ret.next_node_leading_ws = re[0];
            ss = ss.substr(0, re.index); 
        }

        this.markup(this.htmlencode(ss));
        this.source_loc += nlines;
    }
    return ret;
};

/**
 * generate the body of an onevent handler
 * UNLIKE HTML, event handlers use the lexical scope of the template function.
 *  this makes it much easier to write handlers for tags that are generated
 *  inside loops or functions.
 * the disadvantage is that we create lots of little anonymous functions, many of
 *  them unnecessary.  in many cases it would be safe to just inline the event
 *  handler rather than capturing the environment in a closure, but we cant tell
 *  whether an onevent handler has free variables so we always have to create the
 *  closure.
 * there are almost certainly leaks here - use something like
 *  MochiKit.signal for onevent management?
 */
mjt.TemplateCompiler.prototype.compile_onevent_attr = function (aname, avalue) {
    // TODO make sure aname is a known event handler.  we assume it's clean below.

    // BUG http://code.google.com/p/mjt/issues/detail?id=5
    //  this could leak over time, and there's no good
    //  way to gc these keys.  should hang off TemplateCall
    //  rather than mjt._eventcb so the closures will go away
    //  at some point.  the TemplateCall instance is not easily
    //  accessible from the handler string though?
    // probably event setup should be done using jquery once
    //  the dom is constructed.

    var uvar = this.uniqueid(aname + '_cb');  // unique variable
    this.emitln('var ', uvar, ' = __pkg.runtime.uniqueid("', aname, '");');
    // this.emitln('if (typeof this._cb == "undefined") this._cb = {};');
    this.emitln('mjt._eventcb[', uvar, '] = function (event) {');
    this.emit(avalue);
    this.emitln('}');

    // return the new onevent attribute string
    return ('return mjt._eventcb.${' + uvar + '}.apply(this, [event])');
};

/**
 *
 * Extract mjt-specific attributes from a DOM node and 
 * return the non-mjt attributes into a list.
 * Expansion of dynamic attributes is done later.
 *
 * This function is a profiling hotspot - it is one of
 * the inner loops of the compiler since you often have
 * multiple attributes per node.  Speedups welcomed.
 * 
 */
mjt.TemplateCompiler.prototype.get_attributes = function(n, attrs, mjtattrs) {
    // if the tag was namespaced with the mjt namespace, then treat any attributes
    //  without an explicit namespace as mjt attributes
    var mjttag = this.mjtns_re.exec(n.nodeName);

    // mjt.src is used to hide src= attributes within
    //  the template so they arent fetched until the
    //  template is expanded.
    // otherwise, if you have an <img src="$var"> in your you'll
    //  template source you'll get a bogus fetch before template
    //  expansion.
    // this is only needed if compiling HTML in the browser.
    var src_attr = null;

    var srcattrs = n.attributes;
    for (var ai = 0; ai < srcattrs.length; ai++) {
        var attr = srcattrs[ai];
        if (!attr.specified) continue;

        var aname = attr.nodeName;
        var m = this.mjtns_re.exec(aname);
        if (m) {
            var mname = m[1];

            // we dont warn about unknown mjt attrs yet
            mjtattrs[mname] = attr.nodeValue;
            continue;
        }

        // if the tag is in the mjt: namespace, treat plain attributes as mjt namespaced
        if (mjttag && aname.indexOf(':') == -1) {
            if (typeof mjtattrs[aname] != 'undefined')
                 throw new Error('template compiler: ambiguous template attribute: both '
                                 + aname + ' and ' + attr.nodeName + ' are specified');
            mjtattrs[aname] = attr.nodeValue;
            continue;            
        }

        // hold off on src= attribute in case mjt.src= is present.
        // mjt.src is only needed if compiling from browser dom, but 
        // we handle it here too for compatibility.
        if (aname == 'src') {
            src_attr = attr.nodeValue;
            continue;
        }

        var a = {
            name: aname
        };

        if (typeof attr.nodeValue != 'undefined')
            a.value = attr.nodeValue;

        // handle browser DOM quirks
        if (this.browser_dom) {
            // TODO: see
            //  http://tobielangel.com/2007/1/11/attribute-nightmare-in-ie
    
            // cant do vanilla onevent= on IE6 because the dom doesnt
            //  have access to the original string, only to the
            //  compiled js function.  use mjt.onevent=.
            if (aname.substr(0,2) == 'on') {
                mjt.warn(aname, '="..."',
                         'will break on IE6, use',
                         'mjt.' + aname);
            }
    
            if (this._ie_attribute_bs) {
                if (aname == "style") {
                    // IE makes it hard to find out the style value
                    a.value = '' + n.style.cssText;
                } else if (aname == 'CHECKED') {
                    aname = 'checked';
                    a.value = '1';
                } else {
                    var ie_whatever = n.getAttribute(aname, 2);
                    if (ie_whatever)
                        a.value = ie_whatever;
                }
            }
    
            if (typeof a.value == 'number')  // some ie attributes
                a.value = '' + a.value;
        }

        attrs.push(a);
    }

    // IE doesnt show form value= as a node attribute
    if (this.browser_dom && this._ie_attribute_bs && n.nodeName == "INPUT") {
        a = { name: 'value', value: n.value };
        attrs.push(a);
    }

    // finally, patch up the src= attribute if mjt.src was used
    // we do this even if we're not in browser mode for compatibility.
    if (typeof mjtattrs.src != 'undefined') {
        attrs.push({ name: 'src', value: mjtattrs.src });
    } else if (src_attr !== null) {
        attrs.push({ name: 'src', value: src_attr });
    }
};

/**
 *
 * compile a mjt.choose directive
 *
 */
mjt.TemplateCompiler.prototype.compile_choose = function(cn, choose) {
    var choose_state = 'init';
    var tablevar = false;
    var default_label = false;

    if (choose) {
        this.emitln('switch (', choose, ') {');
        choose_state = 'dispatch_init';
    } else {
        mjt.log('choose="" is deprecated, use if...elif...else instead');
    }

    var n = cn.firstChild;
    while (n != null) {
        var nextchild = n.nextSibling;

        var nt = n.nodeType;

        if (nt == 3) { // TEXT_NODE
            if (n.nodeValue.match(/[^ \t\r\n]/)) {
                mjt.warn('only whitespace text is allowed in mjt.choose, found',
                         '"' + n.nodeValue + '"');
            }
            n = nextchild;
            continue;
        }

        if (nt == 1) { // ELEMENT_NODE
            var next_choose_state = choose_state;
            var mjtattrs = {};
            var attrs = [];
            this.get_attributes(n, attrs, mjtattrs);
            var defaultcase = false;

            if (typeof(mjtattrs.when) != 'undefined') {
                defaultcase = false;
            } else if (typeof(mjtattrs.otherwise) != 'undefined') {
                defaultcase = true;
            } else {
                mjt.warn('all elements inside mjt.choose must have a mjt.when= or mjt.otherwise= attribute');
                break;
            }


            if (choose_state == 'init') {
                if (defaultcase) {
                    this.emitln('{');
                    next_choose_state = 'closed';
                } else {
                    this.emitln('if (', mjtattrs.when, ') {');
                    next_choose_state = 'open';
                }
            } else if (choose_state == 'open') {
                if (defaultcase) {
                    // for an if-else chain this is the final else
                    this.emitln('} else {');
                    next_choose_state = 'closed';
                } else {
                    this.emitln('} else if (', mjtattrs.when, ') {');
                    next_choose_state = 'open';
                }
            } else if (choose_state.match(/^dispatch/)) {
                if (choose_state != 'dispatch_init')
                    this.emitln('break;');

                if (defaultcase) {
                    this.emitln('default:');
                    // a slight improvement would be to have a state
                    // 'dispatch_closed' which would detect any
                    // subsequent 'when' clauses.
                    next_choose_state = 'dispatch';
                } else {
                    this.emit('case ');
                    this.emit(this.jsencode(mjtattrs.when));
                    this.emitln(':');
                    next_choose_state = 'dispatch';
                }
            }

            this.compile_node(n, { choose_state: 'in_choose' });

            choose_state = next_choose_state;
        }

        n = nextchild;
    }

    if (choose == '') {
        // end if-else chain
        this.emitln('}');
    } else {
        if (choose_state != 'dispatch_init')
            this.emitln('break;');
        // close switch statement
        this.emitln('};');
    }
};


mjt.TemplateCompiler.prototype.compile_def = function (defattr, n) {
    // parse the signature
    var defn = defattr.match(/^([^(]+)\(([^)]*)\)$/ );
    if (! defn) {
        mjt.warn('bad mjt.def=', defattr,
        ': must contain an argument list');
        return;
    }
    var defname = defn[1];
    var defargs = defn[2];

    if (this.debug)
        this.emitln('// mjt.def=', defattr);

    // this is the actual function declaration
    this.emitln('var ', defname, ' = function (', defargs, ') {');

    // push the function declaration stack
    this.scope = new mjt.Scope(this, this.scope, defattr);

    //this.emit("mjt.log('TCALL', this);\n");
};


mjt.TemplateCompiler.prototype.complete_def = function () {
    // pop the scope declaration stack
    this.scope = this.scope.parent;

    // for text output, the easiest thing to do is to generate the
    //  text will all tags elided but with quoting, then strip
    //  the quoting at the last moment.
    // note that this is only done at the toplevel of a template:
    //  if you have a template library in "text" mode it will
    //  strip the tags but any template definitions from the
    //  library will still return markup-encoded text.
    if (this.scope.toplevel && this.output_mode == 'text')
        this.emitln('return __pkg.runtime.cleanup_noquote(__m);');
    else
        this.emitln('return __m;');
    this.emitln('};');
};


mjt.TemplateCompiler.prototype.generate_open_tag = function (tagname, attrs, attrcode, generate_tcall_id) {
    this.markup('<',tagname);

    var static_attrs = {};
    for (var ai = 0; ai < attrs.length; ai++) {
        var a = attrs[ai];
        if (typeof(a.value) == 'function') {
            mjt.warn('ignoring function-valued attr',
                     tagname, a.name, a.value);
            continue;
        }

        static_attrs[a.name] = a.value;
    }

    if ('id' in static_attrs)
        generate_tcall_id = false;

    // if there is any mjt.attrs code, we must dynamically generate all attributes
    // to handle overrides.
    if (attrcode) {
        var dvar = this.uniqueid('dattrs');
        var svar = this.uniqueid('sattrs');
        this.emitln('var ', dvar, ' = (', attrcode, ');');
        this.emitln('var ', svar, ' = {};');

        for (ai = 0; ai < attrs.length; ai++) {
            var k = attrs[ai].name;
            var v = attrs[ai].value;
            // generate static attributes from template, but check that they
            // are not in the dynamic list first.
            this.emit('if (!(', this.jsencode(k), ' in ', dvar, ')) {'); {
                if (k in this.boolean_attrs) {
                    this.markup(' ', k);
                } else {
                    this.markup(' ', k, '="');
                    this.compile_text(v, true);
                    this.markup('"');
                }
            }
            this.emitln(' }');
        }

        if (generate_tcall_id)
            this.emitln('if (this.subst_id && !("id" in ', dvar, ')) ', dvar, '.id=this.subst_id;');

        // generate dynamic attributes from mjt.attrs code.
        // TODO generate these in sorted order for deterministic output
        var divar = this.uniqueid('di');
        this.emitln('for (var ', divar, ' in ', dvar, ') {');

        // BUG http://code.google.com/p/mjt/issues/detail?id=4
        //     currently boolean_attrs is not passed through to the runtime template
        this.emitln("__m[__n++]=' ' + " + divar + ";");
        this.emitln("__m[__n++]=__pkg.runtime.bless('=\"');");
        this.emitln("__m[__n++]=__pkg.runtime.htmlencode(''+" + dvar + "[" + divar + "]);");
        this.emitln("__m[__n++]=__pkg.runtime.bless('\"');");

        this.emitln('}');
    } else {
        for (ai = 0; ai < attrs.length; ai++) {
            var a = attrs[ai];

            this.markup(' ', a.name, '="');
            this.compile_text(a.value, true);
            this.markup('"');
        }

        // uncomment this to put debug line info into the output.  probably
        //   TemplatePackage.debug_locs is a better way to get this though.
        // if (this.source_loc !== null) {
        //    this.emitln('__m[__n++]=__pkg.runtime.bless(\' loc="' + this.debug_locs.length + ',' + this.source_loc + '"\');\n');
        // }

        if (generate_tcall_id) {
            this.emitln('if (this.subst_id) { __m[__n++]=__pkg.runtime.bless(\' id="\' + this.subst_id + \'"\'); }');
        }
    }
};

/**
 *
 * compile a template from a dom representation.
 *
 */
mjt.TemplateCompiler.prototype.compile_node = function(n, options) {
    if (typeof(options) == 'undefined')
        options = {};

    var choose_state = 'none';
    if (typeof(options.choose_state) != 'undefined')
        choose_state = options.choose_state;

    //mjt.log('NODE', n.nodeType, n.nodeName);

    if (typeof n.getUserData != 'undefined') {
        try {
            var lineno = n.getUserData('lineNumber');
            if (lineno !== null) {
                // getUserData should return a string or null
                if (typeof lineno == 'string')
                    lineno = parseInt(lineno);

                this.source_loc = lineno;
            }
        } catch (e) {
            this.source_loc = null;
        }
    }

    var next_node_leading_ws = null;

    switch (n.nodeType) {
      case 1: // ELEMENT_NODE
        this.compile_element(n, choose_state, options.leading_ws);
        break;

      case 2: // ATTRIBUTE_NODE
        // these are handled in compile_element()
        break;

      case 3: // TEXT_NODE
        var text = n.nodeValue;
        var text_compile = this.compile_text(text, false, options.trim_leading_ws, options.trim_trailing_ws);
        next_node_leading_ws = text_compile.next_node_leading_ws;
        break;

      case 4: // CDATA_SECTION_NODE
        // check that this is doing the correct thing
        //mjt.log('CDATA node');
        if (options.leading_ws)
            this.markup(options.leading_ws);
        this.compile_text(n.nodeValue, false);
        break;
      case 5: // ENTITY_REFERENCE_NODE     &foo;
        // maybe these should be folded into unicode by the time we see them?
        // we pass them through if they get here.
        if (options.leading_ws)
            this.markup(options.leading_ws);
        this.markup('&'+n.nodeName+';');
        break;
      case 6: // ENTITY_NODE
        // should these be folded into unicode by the time we see them?
        mjt.warn('template compiler: skipping dom node type', n.nodeType);
        break;
      case 7: // PROCESSING_INSTRUCTION_NODE    <? ... ?>
        // the browser html parser hides these, but we can get them server-side
        mjt.warn('template compiler: got <? ?>', n.nodeName, n.nodeValue);
        break;
      case 8: // COMMENT_NODE       <!--   -->
        if (options.leading_ws)
            this.markup(options.leading_ws);
        if (this.output_mode != 'text')
            this.markup('<!--'+n.nodeValue+'-->');
        break;
      case 9: // DOCUMENT_NODE
        // should be handled by the xml processor?
        mjt.warn('template compiler: skipping dom node type', n.nodeType);
        break;
      case 10: // DOCUMENT_TYPE_NODE   <!DOCTYPE ... >?
        // should be handled by the xml processor?
        if (options.leading_ws)
            this.markup(options.leading_ws);
      	this.markup('<!DOCTYPE ' + n.nodeName + ' PUBLIC "' + n.publicId + '" "' + n.systemId + '">');
      	mjt.warn('ignoring DOCTYPE', n.nodeName, n.nodeValue);
        break;
      case 11: // DOCUMENT_FRAGMENT_NODE
        // ???
        mjt.warn('template compiler: skipping dom node type', n.nodeType);
        break;
      case 12: // NOTATION_NODE
        // ???
        mjt.warn('template compiler: skipping dom node type', n.nodeType);
        break;

      default:
        mjt.warn('template compiler: unknown dom node type', n.nodeType);
    }
    
    return next_node_leading_ws;
};

mjt.TemplateCompiler.prototype.compile_element = function(n, choose_state, leading_ws) {
    // completions is a call stack but without all the function calls.
    // many attribute handlers require some action before compiling the
    // contents and another action afterward.  this stack accumulates the
    // "afterward" actions.
    var completions = [];
    var render_outer_tag = true;

    var tagname = n.nodeName;
    var tagname_lower = tagname.toLowerCase();
    //mjt.log('ELEMENT', tagname);

    var mjtattrs = {};
    var attrs = [];

    // extract mjt-specific attributes and put the rest in a list.
    //  expansion of mjt.attrs="..." dynamic attributes is done later.
    this.get_attributes(n, attrs, mjtattrs);

    var attrs_by_name = {};
    for (ai = 0; ai < attrs.length; ai++) {
         var a = attrs[ai];
         attrs_by_name[a.name] = a;
    }

    if (this.scope.toplevel) {
        if (typeof mjtattrs.def != 'undefined')
            throw new Error('template compiler: def="' + mjtattrs.def + '" illegal at top element');
        mjtattrs.def = this.scope.toplevel_def;
    }

    // don't output any xml tags if we're in text mode.
    if (this.output_mode == 'text')
        mjtattrs.strip = '1';

    // special handling for some mjt namespaced tags
    var mjttag = this.mjtns_re.exec(n.nodeName);
    if (mjttag) {
        switch (mjttag[1]) {
          case 'script':
            mjtattrs.script = mjtattrs.script || '';    // fake out the existing test
            break;
          case 'none':
            mjt.warn('<mjt:none> is deprecated, use <mjt:block> instead');
            mjtattrs.strip = '1';          // fake out the existing test
            break;
          case 'block':
            mjtattrs.strip = '1';          // fake out the existing test
            break;
          case 'task':
            //mjt.log('got mjt:task');
            if (typeof mjtattrs['var'] == 'string') {
                mjtattrs.task = mjtattrs['var'];
            } else {
                mjt.error('mjt:task requires var= or mjt:var= attribute');
            }
            break;
          case 'doc':
            if (!this.scope.toplevel) {
                mjt.error('mjt:doc is only legal as the toplevel tag');
            }
            mjtattrs.strip = '1';
            if (typeof mjtattrs.type != 'undefined')
                this.document_content_type = mjtattrs.type;
            else
                this.document_content_type = 'text/html';

            if (typeof mjtattrs['xml-pi'] != 'undefined') {
                if (mjtattrs['xml-pi'] == 'true' || mjtattrs['xml-pi'] == '1')
                    this.output_prefix = '<?xml version="1.0" encoding="utf-8" ?>\n';
                else if (mjtattrs['xml-pi'] == 'false' || mjtattrs['xml-pi'] == '0')
                    this.output_prefix = null;
            }

            // compiler settings to change the output style
            if (this.document_content_type == 'text/html')
                this.set_output_mode('html');
            else if (/^text\//.test(this.document_content_type))
                this.set_output_mode('text');
            else if (/^application\/.*xml$/.test(this.document_content_type))
                this.set_output_mode('xml');
            else
                // xml if we don't recognize the content-type
                this.set_output_mode('xml');

            break;
          default:
            mjt.error('ignoring unknown mjt tag', tagname);
            break;
        }
    }

    // the subcompiler is the function that will be used to traverse
    //  the children of this node.  by default it calls compile_node
    //  recursively, but depending on various mjt directives it might
    //  compile subnodes specially or bypass them entirely.
    var subcompiler = null;

    var trim_whitespace = false;
    if (typeof mjtattrs.trim != 'undefined')
        trim_whitespace = true;

    // only set up a subcompiler if there are actually child nodes
    if (n.firstChild !== null) {
        subcompiler = function(n) {
            var child = n.firstChild;

            var opts = {};

            // trim leading ws on the first child only
            if (trim_whitespace)
                opts.trim_leading_ws = true;

            while (child != null) {
                var nextchild = child.nextSibling;

                // trim trailing ws on the last child only
                if (trim_whitespace && nextchild === null)
                    opts.trim_trailing_ws = true;

                opts.leading_ws = this.compile_node(child, opts);

                // reset trim options for the next child
                opts.trim_leading_ws = false;
                opts.trim_trailing_ws = false;

                child = nextchild;
            }
            
            return opts.leading_ws;
        };
    }

    if (tagname_lower == 'script' && this.browser_dom) {
        // passing <script> tags through is confusing in this case
        //  because the browser's dom parser has already evaluated the tag
        //  by the time we see it!
        // passing it through to possibly get executed a second time
        //  in a different environment is too confusing and dangerous
        //  to be useful and is suppressed right here.
        return;
    }
    if (tagname_lower in this.noescape_tags) {
        // noescape_tags include <script> and <style> if generating HTML.
        subcompiler = function (n) {
            var bodyelt = n.firstChild;
            if (bodyelt === null)
                return;
            if (bodyelt.nodeType != 3 || bodyelt.nextSibling) {
                mjt.warn('<' + tagname + '> tag should contain only text');
                return;
            }

            // because we're generating html and not xml we
            // leave script tag bodies unescaped to counteract html's
            // weird rules inside <script>.
            // in particular, html special characters like & are fair game inside
            // <script> except for the specific string "</script" which could
            // be construed as closing the script.

            // for xml we should just wrap //<![CDATA[  ...  ]]>
            //  around the unescaped body, but then we have to look for
            //  ]]> in the body and escape that somehow.  does xml
            //  even have a way of quoting that?
            // perhaps   ]]>]]&gt;<![CDATA[  would work.
            var body = bodyelt.nodeValue;
            var bad_body_re = new RegExp('<\/' + tagname);
            if (body.match(bad_body_re)) {
                // the easy approach to sanitization
                mjt.warn('illegal content for HTML script tag, removed');
            } else {
                // should make it through html <script> body ok

                // compile body, handling ${} substitutions only

                this.emitln(' __m[__n++]=(function () {');
                this.emitln('var __m=__pkg.runtime.new_markuplist(),__n=0;');

                var text_compile = this.compile_text(bodyelt.nodeValue, false, false, false, true);
                var has_subs = text_compile.has_subs;

                // need to do substitution on any </script> or </style> that might
                // have been introduced by substitution.
                // really need to start a subtemplate so that we can capture the
                // output of compile_text at runtime and fix it if needed.
                this.emitln('return __pkg.runtime.cleanup_noquote(__m, '
                            + this.jsencode(tagname_lower) + ');');
                this.emitln('})();');
                
                return text_compile.next_node_leading_ws;
            }
        };
    }

    if (typeof(mjtattrs.task) != 'undefined') {
        this.compile_task(mjtattrs.task, n);
        return;  // elide the whole element
    }

    if (typeof(mjtattrs.def) != 'undefined') {
        if (typeof(attrs.id) != 'undefined') {
            mjt.warn('mjt.def=', mjtattrs.def,
            'must not have an id="..." attribute');
        }

        this.compile_def(mjtattrs.def, n);

        if (this.scope.parent.toplevel) {
            this.emitln('var __pkg = this.tpackage;');
            this.emitln('var exports = this.exports;');
            this.emitln('var __ts=__pkg._template_fragments;');
            this.emitln('var __m=__pkg.runtime.new_markuplist(),__n=0;');
            if (this.output_prefix != null)
                this.markup(this.output_prefix);
        } else {
            this.emitln('var __m=__pkg.runtime.new_markuplist(),__n=0;');
        }

        // completion actions after the inside of the function
        // has been processed.
        completions.push(function () {
            var defscope = this.scope;

            if (defscope.has_tasks) {
                if (!render_outer_tag || typeof(mjtattrs.strip) != 'undefined') {
                    mjt.error('can\'t strip toplevel tag of mjt.def="' + mjtattrs.def + '" tag because it contains tasks');
                }
            }

            // pop the def context
            this.complete_def();

            var defname = mjtattrs.def.replace(/\(.*/, '');

            // toplevel gets a doc_content_type label if available
            if (this.scope.toplevel && this.document_content_type != null) {
                this.emitln(defname, '.doc_content_type = ', this.jsencode(this.document_content_type), ';');
            }

            // except for toplevel functions, build the template function factory here
            if (! this.scope.toplevel) {
                var templatevar = '__pkg';
                this.emitln(defname, ' = __pkg.runtime.tfunc_factory(',
                            this.jsencode(mjtattrs.def), ', ',
                            defname, ', ', templatevar, ', ', defscope.has_tasks, ', ', false, ');');
            }
    
            // template functions defined just below the toplevel go into exports
            if (this.scope.parent && this.scope.parent.toplevel)
                this.emitln('exports.', defname, ' = ', defname, ';');

            // template functions defined just below the toplevel go into exports
            if (typeof defscope.microdata != 'undefined') {
                this.emitln(defname, '.source_microdata = ', JSON.stringify(defscope.microdata.lastvalue), ';');
            }
        });
    }

    if (typeof(mjtattrs['when']) != 'undefined') {
        this.flush_markup();

        // make sure we are in a mjt.choose clause.
        //  if so, the containing compile_choose takes care of things
        if (choose_state != 'in_choose')
            mjt.warn('unexpected mjt.when, in choice state', choose_state);

        completions.push(function () {
            this.flush_markup();
        });
    }

    if (typeof(mjtattrs['otherwise']) != 'undefined') {
        this.flush_markup();

        // make sure we are in a mjt.choose clause.
        //  if so, the containing compile_choose takes care of things
        if (choose_state != 'in_choose')
            mjt.warn('unexpected mjt.otherwise, in choice state ', choose_state);

        completions.push(function () {
            this.flush_markup();
        });
    }


    // handle html5 microdata

    // for some well-known tags the html5 'value' is stored 
    //  in a particular attribute.
    // for others it is in the node's children
    // the <time> tag is special in that the h5value may go in
    //  either the datetime= attribute or the text content
    var h5_tags = {
        'meta':'content',
        'audio':'src', 'embed':'src', 'iframe':'src',
        'img':'src', 'source':'src', 'video':'src',
        'a':'href', 'area':'href', 'link':'href',
        'object':'data',
        'time':'datetime'
    };

    var md = this.scope.microdata;

    // mjt.itemprop="foo" roughly exands to:
    //    mjt.for="itemindex,itemvalue in itemvalue"
    //    itemprop="foo"
    // if the html5 value attribute or element content is not
    //    explicitly provided, the attribute or body will be
    //    set to $itemvalue
    // this has to be checked ahead of mjt.for= because it
    //  generates a synthetic mjt.for= attribute.
    if (md && typeof mjtattrs.itemprop != 'undefined') {
        if (!('itemprop' in attrs_by_name))
            attrs.push({ name: 'itemprop', value: mjtattrs.itemprop });

        // set a property on the currently open item

        // for now forbid props if there is no lexically containing item
        // XXX should allow this, but there must be a variable
        //  called "itemvalue" defined in the function.
        if (md.item === null)
            throw new Error('got mjt.itemprop= without containing mjt.item=');

        // there is an implicit mjt.for= associated with mjt.itemprop=
        if (typeof mjtattrs['for'] != 'undefined') {
            throw new Error(tagname + ' element has both acre:itemprop= and mjt.for="" attributes');
        }
        var itemtmp = 'itemvalue[' + this.jsencode(mjtattrs.itemprop) + ']';
        mjtattrs['for'] = ('itemindex,itemvalue in ('
                           + '(typeof ' + itemtmp + ' == "object" && '
                           + itemtmp + ' !== null && '
                           + itemtmp + ' instanceof Array) ? '
                           + itemtmp + ' : [' + itemtmp + '])');

        if (tagname_lower in h5_tags) {
            var value_attr = h5_tags[tagname_lower];
            if (value_attr in attrs_by_name) {
                // there is a right thing here, not sure what it is yet.
                // for now we ignore the itemprop
                // and assume that the template author has provided
                //  a more useful value than "$itemvalue"
                //mjt.warn(tagname + ' element ' has both acre:itemprop= and '
                //         + value_attr + '= provided');
            } else {
                // insert a new attr 
                attrs.push({ name: value_attr, value: '$itemvalue' });
            }
        } else {
            // if the element content is empty, fill it in with the item value
            if (n.firstChild === null) {
                mjtattrs.content = 'itemvalue';
            }
        }

        // check for special itemprop values?

        // at compile time we build a JSON structure containing the
        //  acre:microdata from the template source.
        // the html5 "value" may be determined by the contents,
        // so we don't do the actual property assignment until we've
        // compiled the children.
        completions.push(function () {
            // figure out the html5 microdata value of the contents

            // XXX should use md.item.contents to generate standard 
            // microdata json format

            var itemprop = mjtattrs.itemprop;
            if (tagname_lower in h5_tags) {
                // get the value of the attr if present
                var value_attr = h5_tags[tagname_lower];
                if (value_attr in attrs) {
                    md.item[itemprop] = attrs[value_attr];
                } else {
                    md.item[itemprop] = null;
                }
            } else {
                // get the microdata value of the element content if
                //  present.  
                if (n.firstChild === null) {
                    md.item[itemprop] = null;
                } else {
                    md.item[itemprop] = md.lastvalue;
                }
            }
//            md.lastvalue = null;
        });
    }

    if (typeof(mjtattrs['for']) != 'undefined') {

        // expect a python style "VAR in EXPR" loop declaration
        var matches = /^(\w+)(\s*,\s*(\w+))?\s+in\s+(.+)$/.exec(mjtattrs['for']);

        if (!matches) {
            // handle javascript style
            //   "(var i = 0 ; i < 3; i++)" declarations
            if (mjtattrs['for'].charAt(0) == '(') {
                this.emitln('for ', mjtattrs['for'], ' {');
                completions.push(function () {
                                     this.emitln('}');  // for (...)
                                 });
            } else {
                mjt.warn('bad mjt.for= syntax');
            }
        } else {
            var var1 = matches[1];
            var var2 = matches[3];
            var forexpr = matches[4];
            var itemid, indexid;

            if (!var2) {   // "for v in items"
                indexid = this.uniqueid(var1 + '_index');
                itemid = var1;
            } else {       // "for k,v in items"
                indexid = var1;
                itemid = var2;
            }

            this.emitln('__pkg.runtime.foreach(this, (', forexpr, '), function (',
                        indexid, ', ', itemid, ') {');

            // "once" is a hack to make "continue;" work inside mjt.for=
            // making "break" and "return" work is too expensive to do all the
            // time but we could scan the body of the for to see if it's
            // necessary?
            var onceid = this.uniqueid('once');
            this.emitln('var ', onceid, ' = 1;');
            this.emitln('while (', onceid, ') {');
            completions.push(function () {
                this.emitln(onceid, '--;');
                this.emitln('} /* while once */');
                this.emitln('return ', onceid, ' ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;');
                this.emitln('}); /* foreach */');
            });
        }
    }

    if (typeof(mjtattrs['if']) != 'undefined') {
        this.emitln('if (', mjtattrs['if'], ') {');

        completions.push(function () {
            this.emitln('}');
        });
    }

    if (typeof(mjtattrs['elif']) != 'undefined') {
        if (!/^\s*$/.exec(this._markup.join(''))) {
            throw new Error('only whitespace is permitted between if="" and elif=""');
        }
        this._markup = [];

        this.emitln('else if (', mjtattrs['elif'], ') {');

        completions.push(function () {
            this.emitln('}');
        });
    }

    if (typeof(mjtattrs['else']) != 'undefined') {
        if (!/^\s*$/.exec(this._markup.join(''))) {
            throw new Error('only whitespace is permitted between if="" and else=""');
        }
        this._markup = [];

        this.emitln('else {');

        completions.push(function () {
            this.emitln('}');
        });
    }

    if (typeof(mjtattrs.script) != 'undefined') {
        // the attribute value specifies an event that
        // should trigger the script.  the default is to
        // run it inline during template generation.
        var ondomready = false;
        switch (mjtattrs.script) {
            case '':
                break;
            case '1':
                // accepted for backwards compat
                break;
            case 'ondomready':
                // delay execution of the script until
                // the surrounding dom is ready in the browser
                ondomready = true;
                break;
            default:
                mjt.warn('reserved mjtattrs.script= value:', mjtattrs.script);
                break;
        }

        // TODO mjt.script should play better with other mjt.* attrs

        if (ondomready) {
            this.emitln('__pkg.runtime.ondomready(function () {');
        }

        var textnode = n.firstChild;
        if (!textnode) {
        } else if (textnode.nodeType != 3 || textnode.nextSibling) {
            mjt.warn("the mjt.script element can only contain javascript text, not HTML.  perhaps you need to quote '<', '>', or '&' (this is unlike a <script> tag!)");
        } else {
            var txt = textnode ? textnode.nodeValue : '';

            if (txt.match(/\/\/ /) && this.browser_dom) {
                // no way to fix this - IE doesnt preserve whitespace
                mjt.warn('"//" comments in mjt.script= definition will fail on IE6');
            }
            var codelines = txt.split('\n');
            for (var li = 0; li < codelines.length; li++) {
                this.emitln(codelines[li]);
                this.source_loc++;
            }
        }

        if (ondomready) {
            this.emitln('}, this);');
        }

        // dont expand anything inside mjt.script
        render_outer_tag = false;
        subcompiler = null;
    }

    if (typeof(mjtattrs.choose) != 'undefined') {
        this.flush_markup();

        subcompiler = function(n) {
            this.compile_choose(n, mjtattrs.choose);
        };
    }

    if (typeof(mjtattrs.replace) != 'undefined') {
        // behaves like mjt.content but strips the outer tag
        render_outer_tag = false;
        subcompiler = function(n) {
            this.emitln('__m[__n++]=(', mjtattrs.replace, ');');
        };
    }

    if (typeof(mjtattrs.content) != 'undefined') {
        subcompiler = function(n) {
            this.emitln('__m[__n++]=(', mjtattrs.content, ');');
        };
    }

    // handle mjt.onevent attrs
    for (var evname in mjtattrs) {
        if (evname.substr(0,2) != 'on') continue;
        if (!this.browser_target) {
            mjt.warn('mjt:onevent= attributes only make sense if targeting a browser');
            continue;
        }
        a = { name: evname,
              value: this.compile_onevent_attr(evname, mjtattrs[evname])
            };
        attrs.push(a);
    }

    // if this.debug is set, annotate the html output with mjt_template="" attributes.
    // this is kind of dirty but handy for debugging.
    // it's definitely not ok when generating xml though, so check for browser_dom.
    //  XXX browser_dom check here isn't quite right
    if (this.debug && this.browser_dom && typeof(mjtattrs.def) != 'undefined') {
        attrs.push({ name: 'mjt_template',
                     value: mjtattrs.def });
    }

    // mjt.item roughly expands to
    //       item
    // mjt.item="foo" roughly expands to
    //       item="foo"
    // and causes "item" to be set to the current "itemvalue"
    // 
    if (md && typeof mjtattrs.item != 'undefined') {
        if (!('item' in attrs_by_name))
            attrs.push({ name: 'item', value: mjtattrs.item });

        // push the microdata item stack
        // create a new item with type and id
        md.stack.push(md.item);

        if ('id' in attrs_by_name) {
            var itemid = attrs_by_name.id.value;
            if (itemid in md.items) {
                md.item = md.items[itemid];
            } else {
                md.item = md.items[itemid] = {};
            }
        } else {
            md.item = {};
        }

        if (mjtattrs.item != '')
            md.item.__type = mjtattrs.item;

        this.emitln('var item = itemvalue;');

        completions.push(function () {
            // pop the microdata item stack
            md.lastvalue = md.item;
            md.item = md.stack.pop();
        });
    }
    if (md && typeof mjtattrs.itemfor != 'undefined') {
        if (!('itemfor' in attrs_by_name))
            attrs.push({ name: 'itemfor', value: mjtattrs.itemfor });

        // push the microdata item stack
        md.stack.push(md.item);

        // work on the item 'itemfor'.
        //  create it if it isn't present
        if (typeof md.items[mjtattrs.itemfor] == 'undefined')
            md.items[mjtattrs.itemfor] = {};
        md.item = md.items[mjtattrs.itemfor];

        completions.push(function () {
            // pop the microdata item stack
            md.lastvalue = md.item;
            md.item = md.stack.pop();
        });
    }

    var stripexpr = (typeof(mjtattrs.strip) != 'undefined')
         ? mjtattrs.strip : null;
    var stripvar = null;

    // if mjt.strip="1" don't bother to generate the if (...) test
    if (stripexpr == '1')
        render_outer_tag = false;

    // the surrounding tag may not get included in the
    // output if it contains some special attributes.
    if (render_outer_tag) {
        var attrcode =  (typeof(mjtattrs.attrs) != 'undefined') ? mjtattrs.attrs : null;

        if (stripexpr !== null) {
            stripvar = this.uniqueid('strip');
            this.emitln('var ', stripvar, ' = (', stripexpr, ');');
            this.emitln('if (!', stripvar, ') {');
        }
        
        if (leading_ws && typeof mjtattrs.def === 'undefined') 
            this.markup(leading_ws);

        if (typeof mjtattrs.def != 'undefined')
            this.generate_open_tag(tagname, attrs, attrcode, true);
        else
            this.generate_open_tag(tagname, attrs, attrcode, false);

        if (subcompiler === null && this.output_mode == 'xml')
            this.markup('/>');
        else
            this.markup('>');

        if (stripexpr !== null)
            this.emitln('}');
    }

    if (subcompiler !== null) {
        if (tagname_lower in this.empty_tags)
            mjt.warn('tag "' + tagname + '" must be empty, content ignored');
        else
            var closing_ws = subcompiler.apply(this, [n]);
    }

    if (render_outer_tag) {
        if (subcompiler === null && this.output_mode == 'xml') {
            // in this case the tag was already closed using <tagname/>
        } else if (tagname_lower in this.empty_tags) {
            // in this case we don't close the tag
        } else if (stripvar) {
            this.emitln('if (!', stripvar, ') {');
            if (typeof closing_ws !== 'undefined')
                this.markup(closing_ws);
            this.markup('</', tagname, '>');
            this.emitln('}');
        } else {
            if (typeof closing_ws !== 'undefined')
                this.markup(closing_ws);
            this.markup('</', tagname, '>');
        }
    }

    // run any completion functions that were queued up by 
    // various features...
    for (var ci = completions.length-1; ci >= 0 ; ci--) {
        completions[ci].apply(this, []);
    }
};
})(mjt);

/** pageapp.js **/
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


/**
 *  fragments of an in-browser application framework.
 *
 *  the initial model is that an application's initial state
 *  is contained in the query section of the uri using
 *  form-urlencoding.  the query section of the uri is
 *  decoded into the mjt.urlquery object when the application
 *  is initialized.  you can change application state by
 *  navigating to the same page with a different query uri.
 *  this works with a standard webserver because apache ignores
 *  the query part of the uri when serving an html file from the
 *  filesystem.
 *
 *  later, support was added for the yahoo ui history manager
 *  <http://developer.yahoo.com/yui/history/>.
 *  this makes it possible to change the state of the app
 *  without a page reload.
 *
 *  the yui history code has many advantages but
 *  the uris generated by yui history are extremely ugly.
 *  in a future version of mjt, i hope to override that
 *  part of yui.
 *
 *  uses  formencode, formdecode, vthunk, log, warn, uniqueid, Task.debug, ...
 *
 */

(function(mjt){

/**
 *  a mjt application with history management.
 *
 *  one of these will be created and available as "mjt.app".
 */

mjt.App = function (argschema) {
    if (typeof argschema == 'undefined')
        argschema = {};

    this.state = null;
    this.yui_history_id = 'mjtapp';


    //mjt.log('new Mjt.App');

    this.argschema = {
            'mjt.server': {
                key: 'mjt.server',
                statekey: 'service_url',
                validator: mjt.validators.service_host
            },
            'mjt.debug': {
                key: 'mjt.debug',
                statekey: 'debug',
                validator: mjt.validators.flag
            }
    };

    for (var k in argschema) {
        this.argschema[k] = argschema[k];
    }

    // callbacks for state change notification
    this._onstatechange = {};

    this.init();
};

/**
 *  initialize the application
 *
 *  this should be done early (before onload())
 *
 */
mjt.App.prototype.init = function () {
    this.init_state();

    //mjt.log('Mjt.App.init', this.state);

    // XXX these should be triggered by onstatechange
    mjt.service_url = this.state.service_url;

    // this is kind of ugly here.  where should mjt.freebase
    //  be initialized?
    mjt.freebase.set_service_url(this.state.service_url);
    mjt.debug = this.state.debug;
    mjt.Task.debug = this.state.debug; //WILL: how could we specify these separately?
    mjt.urlquery = this.state;

    return this;
};


/**
 *  register an onstatechange handler
 *
 */
mjt.App.prototype.onstatechange = function (THUNK_ARGS) {
    var tid = mjt.uniqueid('statecb');
    this._onstatechange[tid] = mjt.vthunk(arguments);
    return this;
};


/**
 *  notify all onstatechange handlers
 *
 */
mjt.App.prototype.refresh = function () {
    for (var k in this._onstatechange) {
        this._onstatechange[k].apply(this, []);
    }
    return this;
};


/**
 *  handler for yui history events
 *
 */
//   init/forward/back changes.
// not called for explicit mark_history()
mjt.App.prototype._handle_onhistory = function (rstate) {
    mjt.log('yui setting state', rstate, typeof this.state);

    if (rstate === null) {
        rstate = YAHOO.util.History.getCurrentState(this.yui_history_id);
        mjt.log('yui history onLoadEvent:', rstate);
    } else {
        mjt.log('yui history state:', rstate);
    }

    this.state = rison.decode_object(rstate);
    this.refresh();
};

// see http://developer.yahoo.com/yui/history/
// must be called early!
mjt.App.prototype.init_state = function () {
    // parse the query sections of the url, if present.
    var qstr;
    var qstate = null;

    if (typeof window != 'undefined')
        qstr = window.location.search;
    if (typeof acre != 'undefined')
        qstr = acre.environ.query_string;

    if (typeof(qstr) == 'string' && qstr.length > 0 && qstr.charAt(0) == '?')
        this.state = qstate = this.decode_uristate(qstr.substr(1));
    else
        this.state = this.decode_uristate('');

    // if yui history isn't loaded, we're done
    if (typeof YAHOO === 'undefined' || !YAHOO.util.History)
        return this;

    // otherwise, initialize yui history
    var history = YAHOO.util.History;

    // yui history mechanism overrides query args
    var init_state = history.getBookmarkedState(this.yui_history_id);
    if (!init_state) {
        init_state = rison.encode_object(this.state);
    }

    mjt.log('yui history initial state', init_state);

    history.register(this.yui_history_id, init_state,
                     mjt.vthunk('_handle_onhistory', this));

    if (qstate !== null) {
        // XXX should probably set document.location to clear the
        // query section of the uri, since yui history will be
        // managing state instead and having the initial state in
        // the query section of the url is just confusing.
        // this is tricky to do politely - revisit when beautifying yui urls.
    }

    // callback for forward/back events
    history.onLoadEvent.subscribe(mjt.vthunk('_handle_onhistory', this, null));

    // must be done last
    // XXX these should not need to be hardcoded
    history.initialize('yui-history-iframe', 'yui-history-field');

    return this;
};



/**
 *  make sure that the current app state is bookmarkable
 *
 */
mjt.App.prototype.mark_history = function () {
    if (this.yui_history_id === null) {
        // XXX should set document.location?
        return;
    }

    var rstate = rison.encode_object(this.state);
    //mjt.warn('NAV', this.yui_history_id, rstate);
    YAHOO.util.History.navigate(this.yui_history_id, rstate);
};






mjt.Validator = function () {
};
mjt.Validator.prototype.encode = function (v) {
    if (v == this.default_value)
        return undefined;
    return this.encodestr(v);
};
mjt.Validator.prototype.decode = function (v) {
    if (typeof v == 'undefined')
        return this.default_value;
    return this.decodestr(v);
};

mjt.validators = {};

/**
 *  a flag validator translates a flag from a query uri
 */
mjt.validators.flag = new mjt.Validator();
mjt.validators.flag.default_value = false;
mjt.validators.flag.encodestr = function (bool) {
    return bool ? '1' : undefined;
};
mjt.validators.flag.decodestr = function (str) {
    return str == '1' ? true : false;
};


/**
 *  a service_host validator translates a service host from a query uri
 *   it abbreviates it if possible to keep the uri short and legible.
 */
mjt.validators.service_host = new mjt.Validator();
// XXX abstract this out
mjt.validators.service_host.default_value = 'http://www.freebase.com';

/**
 * construct a short name for a service host.
 * takes the server url, strips off any "http://" prefix,
 * and abbreviates the server which served this page as ".".
 *
 * @param server URI  the URI for the server
 * @returns string    a short name for the server
 *
 */
mjt.validators.service_host.encodestr = function (server) {
    var host = server.replace(/^http:\/\//, '');

    if (typeof window != 'undefined'
        && host == window.location.host)
        return '.';

    return host;
};

mjt.validators.service_host.decodestr = function (server) {
    if (server.substr(0,4) == 'http')
        url = server;
    else if (server == '.') {
        if (typeof window != 'undefined')
            url = window.location.protocol + '//' + window.location.host;
        if (typeof acre != 'undefined')
            url = acre.environ.server_protocol + '//' + acre.environ.host
    } else
        url = 'http://' + server;
    return url;
};





/*
// get/set using dot-separated paths through the js object graph
mjt.App.prototype.jsvar_getset = function (varpath, value) {
    // locate var
    var objpath = argspec.jsvar.split('.');

    var obj = window;
    var key;
    key = objpath.shift();
    if (key == '') {
        obj = this.state;
        key = objpath.shift();
    }

    while (objpath.length > 0)  {
        obj = obj[key];
        key = objpath.shift();
    }

    if (typeof value == 'undefined')
        return obj[key];

    obj[key] = value;
    return value;
};
*/


/**
 *  encode the app state into a string, suitable for use in a uri
 *
 *  this is complicated by the desire to have human-readable
 *  uris and by a certain amount of legacy cruft.
 *
 *  values should be a dict overriding the *state* value
 *
 */
mjt.App.prototype.encode_uristate = function(values) {
    var qd = {};
    var state_encoded = {};
    var k, argspec;

    // build a dict of args by statekey
    var args_by_statekey = {}
    for (k in this.argschema) {
        argspec = this.argschema[k];
        args_by_statekey[argspec.statekey] = argspec;
    }

    // build the url query dict
    for (k in this.state) {
        argspec = args_by_statekey[k];
        if (typeof argspec != 'undefined')
            qd[argspec.key] = argspec.validator.encode(this.state[k]);
        else
            qd[k] = this.state[k];
    }

    // override from the values array
    for (k in values) {
        argspec = args_by_statekey[k];
        if (typeof argspec != 'undefined')
            qd[argspec.key] = argspec.validator.encode(values[k]);
        else
            qd[k] = values[k];
    }

    // strip any undefined values that might have gotten in there.
    for (k in qd) {
        if (typeof qd[k] == 'undefined')
            delete qd[k];
    }

    return mjt.formencode(qd);
};


mjt.App.prototype.decode_uristate = function(qstr) {
    var state = {};
    var qd = mjt.formdecode(qstr);
    var argspec, k;

    for (k in qd) {
        argspec = this.argschema[k];
        if (typeof argspec != 'undefined')
            state[argspec.statekey] = argspec.validator.decode(qd[k]);
        else
            state[k] = qd[k];
    }

    // defaults
    for (k in this.argschema) {
        argspec = this.argschema[k];
        var skey = argspec.statekey;
        if (!(skey in state))
            state[skey] = argspec.validator.default_value;
    }

    return state;
};



/**
 * create a url that propagates the mjt application state.
 *
 * for use primarily if yui history is not present
 *
 * @param base    URI     the base url, with no query or fragment component
 * @param values  Object  additional state to encode into the query component
 * @returns       URI     a URI constructed from base, values, and
 *                        the current mjt application state.
 *
 */
// was mjt.form_mjt_url
mjt.App.prototype.href = function(base, values) {
    if (typeof base == 'undefined' || base === null)
        base = location.protocol + '//' + location.host + location.pathname;
    var qstr = this.encode_uristate(values);
    return base + (qstr ? '?' + qstr : '');
};


})(mjt);

/** mjtjquery.js **/
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

/*
* jQuery mjt glue
*
*  example usage: $('#some_id').mjt(my_mjt_lib.my_template(template_args));
* 
*  example usage: $('#some_id').acre(my_mjt_lib.my_template(template_args));
*
*  example usage: $(window).trigger("acre.template.register", { pkgid: "my_mjt_lib", source: my_mjt_js_source });
*  example usage: $('#some_id').acre("my_mjt_lib", "my_template", template_args_array);
*/
;if (typeof jQuery != 'undefined') (function($) {

    if (typeof $ == 'undefined') return;

    var templates = {};

    function register_template_package(pkgid, pkg) {
        if (typeof pkgid === 'string' && typeof pkg === 'object') {
            // if it's a raw JS package sent from the server, instantiate it as a template package
            if (pkg.def) {
                pkg = (new mjt.TemplatePackage()).init_from_js(pkg).toplevel();
            }
            templates[pkgid] = pkg;
        }
    }
    
    function get_html(markup_or_pkgid, def, args) {
        var html = "";
        if (typeof markup_or_pkgid === 'string') {
            var pkg = templates[markup_or_pkgid];
            if (typeof pkg === 'object') {
                var template = pkg[def];
                if (typeof template === 'function') {
                    html = mjt.flatten_markup(template.apply(this, args));
                } else {
                    console.warn("acre template '" + def + "' does not exist in package '" + markup_or_pkgid + "'");
                }
            } else {
                console.warn("acre template package '" + markup_or_pkgid + "' has not been registered");
            }            
        } else {
            html = mjt.flatten_markup(markup_or_pkgid);
        }
        return html;
    }

    // Handle compiled template package source sent from the server
    $(window).bind('acre.template.register', function(e, data){
        register_template_package(data.pkgid, data.source);
    });

    // set the innerHTML for each selected node to a mjt template result
    $.fn.mjt = function(markup) {
        var html = mjt.flatten_markup(markup);
        return this.each(function(){
            this.innerHTML = html;
        });
    };

    $.fn.acre = function(markup_or_pkgid, def, args) {
        return this.each(function(){
            $(this).html(get_html(markup_or_pkgid, def, args));
        });
    };
    
    $.acre = function(markup_or_pkgid, def, args) {
        return get_html(markup_or_pkgid, def, args);
    };
    
})(jQuery);

/** jquerytools, overlay.js **/
/**
 * @license 
 * jQuery Tools @VERSION Overlay - Overlay base. Extend it.
 * 
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 * 
 * http://flowplayer.org/tools/overlay/
 *
 * Since: March 2008
 * Date: @DATE 
 */
(function($) { 

	// static constructs
	$.tools = $.tools || {version: '@VERSION'};
	
	$.tools.overlay = {
		
		addEffect: function(name, loadFn, closeFn) {
			effects[name] = [loadFn, closeFn];	
		},
	
		conf: {  
			close: null,	
			closeOnClick: true,
			closeOnEsc: true,			
			closeSpeed: 'fast',
			effect: 'default',
			
			// since 1.2. fixed positioning not supported by IE6
			fixed: !$.browser.msie || $.browser.version > 6, 
			
			left: 'center',		
			load: false, // 1.2
			mask: null,  
			oneInstance: true,
			speed: 'normal',
			target: null, // target element to be overlayed. by default taken from [rel]  
			top: '10%'
		}
	};

	
	var instances = [], effects = {};
		
	// the default effect. nice and easy!
	$.tools.overlay.addEffect('default', 
		
		/* 
			onLoad/onClose functions must be called otherwise none of the 
			user supplied callback methods won't be called
		*/
		function(pos, onLoad) {
			
			var conf = this.getConf(),
				 w = $(window);				 
				
			if (!conf.fixed)  {
				pos.top += w.scrollTop();
				pos.left += w.scrollLeft();
			} 
				
			pos.position = conf.fixed ? 'fixed' : 'absolute';
			this.getOverlay().css(pos).fadeIn(conf.speed, onLoad); 
			
		}, function(onClose) {
			this.getOverlay().fadeOut(this.getConf().closeSpeed, onClose); 			
		}		
	);		

	
	function Overlay(trigger, conf) {		
		
		// private variables
		var self = this,
			 fire = trigger.add(self),
			 w = $(window), 
			 closers,            
			 overlay,
			 opened,
			 maskConf = $.tools.expose && (conf.mask || conf.expose),
			 uid = Math.random().toString().slice(10);		
		
			 
		// mask configuration
		if (maskConf) {			
			if (typeof maskConf == 'string') { maskConf = {color: maskConf}; }
			maskConf.closeOnClick = maskConf.closeOnEsc = false;
		}			 
		 
		// get overlay and triggerr
		var jq = conf.target || trigger.attr("rel");
		overlay = jq ? $(jq) : null || trigger;	
		
		// overlay not found. cannot continue
		if (!overlay.length) { throw "Could not find Overlay: " + jq; }
		
		// trigger's click event
		if (trigger && trigger.index(overlay) == -1) {
			trigger.click(function(e) {				
				self.load(e);
				return e.preventDefault();
			});
		}   			
		
		// API methods  
		$.extend(self, {

			load: function(e) {
				
				// can be opened only once
				if (self.isOpened()) { return self; }
				
				// find the effect
		 		var eff = effects[conf.effect];
		 		if (!eff) { throw "Overlay: cannot find effect : \"" + conf.effect + "\""; }
				
				// close other instances?
				if (conf.oneInstance) {
					$.each(instances, function() {
						this.close(e);
					});
				}
				
				// onBeforeLoad
				e = e || $.Event();
				e.type = "onBeforeLoad";
				fire.trigger(e);				
				if (e.isDefaultPrevented()) { return self; }				

				// opened
				opened = true;
				
				// possible mask effect
				if (maskConf) { $(overlay).expose(maskConf); }				
				
				// position & dimensions 
				var top = conf.top,					
					 left = conf.left,
					 oWidth = overlay.outerWidth({margin:true}),
					 oHeight = overlay.outerHeight({margin:true}); 
				
				if (typeof top == 'string')  {
					top = top == 'center' ? Math.max((w.height() - oHeight) / 2, 0) : 
						parseInt(top, 10) / 100 * w.height();			
				}				
				
				if (left == 'center') { left = Math.max((w.width() - oWidth) / 2, 0); }

				
		 		// load effect  		 		
				eff[0].call(self, {top: top, left: left}, function() {					
					if (opened) {
						e.type = "onLoad";
						fire.trigger(e);
					}
				}); 				

				// mask.click closes overlay
				if (maskConf && conf.closeOnClick) {
					$.mask.getMask().one("click", self.close); 
				}
				
				// when window is clicked outside overlay, we close
				if (conf.closeOnClick) {
					$(document).bind("click." + uid, function(e) { 
						if (!$(e.target).parents(overlay).length) { 
							self.close(e); 
						}
					});						
				}						
			
				// keyboard::escape
				if (conf.closeOnEsc) { 

					// one callback is enough if multiple instances are loaded simultaneously
					$(document).bind("keydown." + uid, function(e) {
						if (e.keyCode == 27) { 
							self.close(e);	 
						}
					});			
				}

				
				return self; 
			}, 
			
			close: function(e) {

				if (!self.isOpened()) { return self; }
				
				e = e || $.Event();
				e.type = "onBeforeClose";
				fire.trigger(e);				
				if (e.isDefaultPrevented()) { return; }				
				
				opened = false;
				
				// close effect
				effects[conf.effect][1].call(self, function() {
					e.type = "onClose";
					fire.trigger(e); 
				});
				
				// unbind the keyboard / clicking actions
				$(document).unbind("click." + uid).unbind("keydown." + uid);		  
				
				if (maskConf) {
					$.mask.close();		
				}
				 
				return self;
			}, 
			
			getOverlay: function() {
				return overlay;	
			},
			
			getTrigger: function() {
				return trigger;	
			},
			
			getClosers: function() {
				return closers;	
			},			

			isOpened: function()  {
				return opened;
			},
			
			// manipulate start, finish and speeds
			getConf: function() {
				return conf;	
			}			
			
		});
		
		// callbacks	
		$.each("onBeforeLoad,onStart,onLoad,onBeforeClose,onClose".split(","), function(i, name) {
				
			// configuration
			if ($.isFunction(conf[name])) { 
				$(self).bind(name, conf[name]); 
			}

			// API
			self[name] = function(fn) {
				$(self).bind(name, fn);
				return self;
			};
		});
		
		// close button
		closers = overlay.find(conf.close || ".close");		
		
		if (!closers.length && !conf.close) {
			closers = $('<a class="close"></a>');
			overlay.prepend(closers);	
		}		
		
		closers.click(function(e) { 
			self.close(e);  
		});	
		
		// autoload
		if (conf.load) { self.load(); }
		
	}
	
	// jQuery plugin initialization
	$.fn.overlay = function(conf) {   
		
		// already constructed --> return API
		var el = this.data("overlay");
		if (el) { return el; }	  		 
		
		if ($.isFunction(conf)) {
			conf = {onBeforeLoad: conf};	
		}

		conf = $.extend(true, {}, $.tools.overlay.conf, conf);
		
		this.each(function() {		
			el = new Overlay($(this), conf);
			instances.push(el);
			$(this).data("overlay", el);	
		});
		
		return conf.api ? el: this;		
	}; 
	
})(jQuery);


/** cuecard-api.js **/
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

if (!("CueCard" in window)) {
    (function() {

        var acreAppUrl = "http://www.freebase.com/cuecard/";
        
        window.CueCard = {
            loaded:                 false,
            version:                "trunk",
            loadingScriptsCount:    0,
            error:                  null,
            helper: acreAppUrl,
            apiProxy: {
                base : acreAppUrl,
                read:  "mqlread?",
                write: "mqlwrite?"
            },
            freebaseServiceUrl:     "http://www.freebase.com/",
            params:                 { bundle: true, externals: true }
        };
        
        var getHead = function(doc) {
            return doc.getElementsByTagName("head")[0];
        };
        CueCard.findScript = function(doc, substring) {
            var heads = doc.documentElement.getElementsByTagName("head");
            for (var h = 0; h < heads.length; h++) {
                var node = heads[h].firstChild;
                while (node != null) {
                    if (node.nodeType == 1 && node.tagName.toLowerCase() == "script") {
                        var url = node.src;
                        var i = url.indexOf(substring);
                        if (i >= 0) {
                            return url;
                        }
                    }
                    node = node.nextSibling;
                }
            }
            return null;
        };
        CueCard.parseURLParameters = function(url, to, types) {
            to = to || {};
            types = types || {};
            
            if (typeof url == "undefined") {
                url = location.href;
            }
            var q = url.indexOf("?");
            if (q < 0) {
                return to;
            }
            url = (url+"#").slice(q+1, url.indexOf("#")); // toss the URL fragment
            
            var params = url.split("&"), param, parsed = {};
            var decode = window.decodeURIComponent || unescape;
            for (var i = 0; param = params[i]; i++) {
                var eq = param.indexOf("=");
                var name = decode(param.slice(0,eq).replace(/\+/g, ' '));
                var old = parsed[name];
                if (typeof old == "undefined") {
                    old = [];
                } else if (!(old instanceof Array)) {
                    old = [old];
                }
                parsed[name] = old.concat(decode(param.slice(eq+1).replace(/\+/g, ' ')));
            }
            for (var i in parsed) {
                if (!parsed.hasOwnProperty(i)) continue;
                var type = types[i] || String;
                var data = parsed[i];
                if (!(data instanceof Array)) {
                    data = [data];
                }
                if (type === Boolean && data[0] == "false") {
                    to[i] = false; // because Boolean("false") === true
                } else {
                    to[i] = type.apply(this, data);
                }
            }
            return to;
        };
        
        if (typeof CueCard_urlPrefix == "string") {
            CueCard.urlPrefix = CueCard_urlPrefix;
        } else {
            var url = CueCard.findScript(document, "cuecard-api.js");
            if (url == null) {
                CueCard.error = new Error("Failed to derive URL prefix for CueCard API code files");
                return;
            }

            CueCard.urlPrefix = url.substr(0, url.indexOf("cuecard-api.js"));
        }

        CueCard.parseURLParameters(url, CueCard.params, {bundle:Boolean, externals:Boolean});
        
        CueCard.loaded = true;
    })();
}
/** cuecard.js **/
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

CueCard.createComposition = function(options) {
    var qe = new CueCard.QueryEditor(options.queryEditorElement, options["queryEditorOptions"]);
    var op = null;
    var cp = null;
    if ("outputPaneElement" in options) {
        var opo = options["outputPaneOptions"] || {};
        opo.queryEditor = qe;
        
        op = new CueCard.OutputPane(options.outputPaneElement, opo);
        qe.setOutputPane(op);
    }
    if ("controlPaneElement" in options) {
        var cpo = options["controlPaneOptions"] || {};
        cpo.queryEditor = qe;
        if (op != null) {
            cpo.outputPane = op;
        }
        
        cp = new CueCard.ControlPane(options.controlPaneElement, cpo);
        qe.setControlPane(cp);
    }
    
    return {
        queryEditor: qe,
        outputPane: op,
        controlPane: cp
    };
};

CueCard.showDialog           = function(dialogname /*, arg1, arg2, etc. */) {
    var args = Array.prototype.slice.call(arguments);
    args.shift();

    var dialog = $("<div id='dialog-" + dialogname + "' class='modal'></div>").acre(fb.acre.apps.cuecard + "/dialogs", dialogname, args);   
    $(document.body).append(dialog.hide());

    dialog.overlay({
        load: true,
        mask: {
            color: '#000',
            loadSpeed: 200,
            opacity: 0.5
        },
        close: ".modal-buttons .button",
        closeOnClick: false,
        onClose: function() {
            dialog.remove();
        }
    });
};
/** mql-syntax.js **/
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

CueCard.MqlSyntax = {};

CueCard.MqlSyntax.KeywordSuggestions = [
    {   label: "*",
        hint: "(keyword)",
        qualifiedProperty: "*",
        result: "*"
    },
    {   label: "connect",
        hint: "(keyword)",
        qualifiedProperty: "connect",
        result: "connect"
    },
    {   label: "create",
        hint: "(keyword)",
        qualifiedProperty: "create",
        result: "create"
    },
    {   label: "estimate-count",
        hint: "(keyword)",
        qualifiedProperty: "estimate-count",
        result: "estimate-count"
    },
    {   label: "limit",
        hint: "(keyword)",
        qualifiedProperty: "limit",
        result: "limit"
    },
    {   label: "optional",
        hint: "(keyword)",
        qualifiedProperty: "optional",
        result: "optional"
    },
    {   label: "return",
        hint: "(keyword)",
        qualifiedProperty: "return",
        result: "return"
    },
    {   label: "sort",
        hint: "(keyword)",
        qualifiedProperty: "sort",
        result: "sort"
    }
];

CueCard.MqlSyntax.KeywordValueHints = {
    "*" : {
        choices: [
            {   label: "null",
                hint: "return a single value",
                result: null
            },
            {   label: "[]",
                hint: "return a list of values",
                result: [],
                offset: 1
            },
            {   label: "{}",
                hint: "return a single object",
                result: {},
                offset: 1
            },
            {   label: "[{}]",
                hint: "return a list of objects",
                result: [{}],
                offset: 2
            }
        ]
    },
    "connect" : {
        choices: [
            {   label:  "insert",
                hint:   "attach a value or object to a non-unique property, or attach the first value or object to a unique property",
                result: "insert"
            },
            {   label:  "update",
                hint:   "attach a value or object to a unique property replacing any value or object that was previously connected",
                result: "update"
            },
            {   label:  "replace",
                hint:   "update unique properties and performs an insert for non-unique properties",
                result: "replace"
            },
            {   label:  "delete",
                hint:   "detach a value or object from any property",
                result: "delete"
            }
        ]
    },
    "create" : {
        choices: [
            {   label: "unless_exists",
                hint: "look for a matching object and create it if it doesn't exist",
                result: "unless_exists"
            },
            {   label:  "unless_connected",
                hint:   "look for a matching object connected to the parent query, and create and connect it if it doesn't exist",
                result: "unless_connected"
            },
            {   label:  "unconditional",
                hint:   "create the specified object without looking for a match (dangerous; ues carefully)",
                result: "unconditional"
            }
        ]
    },
    "estimate-count" : {
        choices: [
            {   label: "null",
                hint: "(keyword)",
                result: null
            }
        ]
    },
    "limit" : {
        html: 'Use a positive integer to limit how many results to return, or <span class="cuecard-code">0</span> for all available results.'
    },
    "optional" : {
        choices: [
            {   label: "true",
                hint: "(keyword)",
                result: true
            },
            {   label: "false",
                hint: "(keyword)",
                result: false
            },
            {   label: "required",
                hint: "(keyword)",
                result: "required"
            },
            {   label: "forbidden",
                hint: "(keyword)",
                result: "forbidden"
            }
        ]
    },
    "return" : {
        choices: [
            {   label: "count",
                hint: "(keyword)",
                result: "count"
            },
            {   label: "estimate-count",
                hint: "(keyword)",
                result: "estimate-count"
            }
        ]
    },
    "sort" : {
        html: 'Use a property name in the same query node. Prefix it with <span class="cuecard-code">-</span> to sort in descending order. For more complex ordering, see <a href="">this documentation</a>.'
    }
};

CueCard.MqlSyntax.UniqueTopicValueSuggestions = [
    {   label:  "null",
        hint:   "returns a single topic ID",
        result: null
    },
    {   label: "{}",
        hint: "returns a single topic object with a default set of properties",
        result: {},
        offset: 1
    },
    {   label: "{ \"id\" : null, \"name\" : null }",
        hint: "returns a single topic object with id and name",
        result: { "id" : null, "name" : null }
    }
];

CueCard.MqlSyntax.TopicValueSuggestions = [
    {   label: "[]",
        hint: "returns a list of topic IDs or topic names",
        result: [],
        offset: 1
    },
    {   label: "[{}]",
        hint: "returns a list of topic objects with a default set of properties",
        result: [{}],
        offset: 2
    },
    {   label: "[{ \"id\" : null, \"name\" : null, \"optional\" : true, \"limit\" : 10 }]",
        hint: "returns an optional, limited list of topic objects with id and name",
        result: [{ "id" : null, "name" : null, "optional" : true, "limit" : 10 }]
    }
];

CueCard.MqlSyntax.SingleValueSuggestions = [
    {   label:  "null",
        hint:   "returns a single value",
        result: null
    },
    {   label: "{ \"value\" : null, \"type\" : null }",
        hint: "returns a value with type",
        result: { "value" : null, "type" : null }
    }
];

CueCard.MqlSyntax.UniqueStringLiteralValueSuggestions = [
    {   label:  "null",
        hint:   "returns a single string",
        result: null
    },
    {   label:  "{ \"value\" : null, \"lang\" : null, \"optional\" : true }",
        hint:   "returns a single string with more options",
        result: { "value" : null, "lang" : null, "optional" : true }
    }
];

CueCard.MqlSyntax.StringLiteralValueSuggestions = [
    {   label:  "[]",
        hint:   "returns a list of strings",
        result: null
    },
    {   label:  "[{ \"value\" : null, \"lang\" : null, \"optional\" : true }]",
        hint:   "returns a list of strings with more options",
        result: [{ "value" : null, "lang" : null, "optional" : true }]
    }
];

CueCard.MqlSyntax.UniqueLiteralValueSuggestions = [
    {   label:  "null",
        hint:   "returns a single value",
        result: null
    },
    {   label:  "{ \"value\" : null, \"optional\" : true }",
        hint:   "returns a single value with more options",
        result: { "value" : null, "optional" : true }
    }
];

CueCard.MqlSyntax.LiteralValueSuggestions = [
    {   label:  "[]",
        hint:   "returns a list of values",
        result: null
    },
    {   label:  "[{ \"value\" : null, \"optional\" : true }]",
        hint:   "returns a list of values with more options",
        result: [{ "value" : null, "optional" : true }]
    }
];
/** indent-writer.js **/
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

// Copied from http://simile.mit.edu/repository/juggler/trunk/src/main/webapp/scripts/lib/jsonizer.js

CueCard.SerializingContext = function(parent) {
    this._parent = parent;
    this._root = (parent == null) ? this : parent.getRoot();
    this._properties = {};
}
CueCard.SerializingContext.prototype = {
    getProperty: function(name) {
        return (name in this._properties) ?
            this._properties[name] :
            (this._parent != null ? this._parent.getProperty(name) : null);
    },
    setProperty: function(name, value) {
        this._properties[name] = value;
    },
    getRoot: function() {
        return this._root;
    },
    getRootProperty: function(name) {
        return this.getRoot().getProperty(name);
    },
    setRootProperty: function(name, value) {
        return this.getRoot().setProperty(name, value);
    },
    create: function() {
        return new SerializingContext(this);
    }
};

CueCard.IndentWriter = function(context) {
    this._context = context;
    this._stream = context.getProperty("stream");
}
CueCard.IndentWriter.prototype = {
    appendLineBreak: function() {
        this._stream.append("\n");
    },
    appendIndent: function() {
        var indentLevel = this._context.getRootProperty("indentLevel");
        var indentString = this._context.getRootProperty("indentString");
        for (var i = 0; i < indentLevel; i++) {
            this._stream.append(indentString);
        }
    },
    indent: function() {
        this._context.setRootProperty("indentLevel", this._context.getRootProperty("indentLevel") + 1);
    },
    unindent: function() {
        this._context.setRootProperty("indentLevel", this._context.getRootProperty("indentLevel") - 1);
    },
    append: function(s) {
        this._stream.append(s);
    }
};

/** jsonize.js **/
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

// Copied from http://simile.mit.edu/repository/juggler/trunk/src/main/webapp/scripts/lib/jsonizer.js

/*
 *  Some code adapted from http://www.json.org/json.js.
 */
(function() {
    var javascriptEscapeCharacters = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\'': '\\\'',
        '\\': '\\\\'
    };

    function encodeJavascriptString(x) {
        if (/["\\\x00-\x1f]/.test(x)) {
            return x.replace(/([\x00-\x1f\\"])/g, function(a, b) {
                var c = javascriptEscapeCharacters[b];
                if (c) {
                    return c;
                }
                c = b.charCodeAt();
                return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
            });
        } else {
            return x;
        }
    }
    
    function isObject(o) {
        return o != null && typeof o == "object" && !(o instanceof Array) && !("__identifier__" in o);
    }
    
    function isArray(o) {
        return o != null && o instanceof Array;
    }
    
    function objectHasFields(o) {
        for (var n in o) {
            if (o.hasOwnProperty(n)) {
                return true;
            }
        }
        return false;
    }
    
    function arrayIsEffectivelyEmpty(a) {
        return a.length == 0 || (a.length == 1 && isObject(a[0]) && !objectHasFields(a[0]));
    }

    var jsonize = CueCard.jsonize = function(o, params) {
        params = (params) ? params : {};
        
        var result = "";
        
        var quoteAllFieldNames = ("quoteAllFieldNames" in params) ? params.quoteAllFieldNames : true;
        var variables = ("variables" in params) ? params.variables : {};
        var resolveVariables = ("resolveVariables" in params) ? params.resolveVariables : false;
        
        if ("context" in params) {
            var context = new CueCard.SerializingContext(params.context);
        } else {
            var indentCount = ("indentCount" in params) ? params.indentCount : 4;
            var indentString = ""; for (var i = 0; i < indentCount; i++) indentString += " ";
        
            var context = new CueCard.SerializingContext(null);
            context.setProperty("indentCount", indentCount);
            context.setProperty("indentString", indentString);
            context.setProperty("indentLevel", 0);
            context.setProperty("stream", {
                append: function(s) {
                    result += s;
                }
            });
        }
        context.setProperty("omitWhitespace", ("omitWhitespace" in params) ? params.omitWhitespace : false);
        context.setProperty("maxFieldLength", ("maxFieldLength" in params) ? params.maxFieldLength : 15);
        context.setProperty("breakLines", ("breakLines" in params) ? params.breakLines : true);
        context.setProperty("alignFieldValues", ("alignFieldValues" in params) ? params.alignFieldValues : true);
        context.setProperty("collapseSingleObjectArray", ("collapseSingleObjectArray" in params) ? params.collapseSingleObjectArray : true);
        context.setProperty("variables", variables);
        context.setProperty("resolveVariables", resolveVariables);
        context.setProperty("encodeJavascriptString", ("encodeJavascriptString" in params) ? params["encodeJavascriptString"] : encodeJavascriptString);
        
        context.setRootProperty("fieldNameEncoder", {
            _m: {},
            encode: function(s) {
                if (s in this._m) {
                    return this._m[s];
                } else {
                    var t = encodeJavascriptString(s);
                    this._m[s] = t = (quoteAllFieldNames || /\W/.test(t)) ? ('"' + t + '"') : t;
                    return t;
                }
            }
        });
        context.setProperty("path", []);
        context.setRootProperty(
            "contextualize", 
            ("contextualize" in params) ? params.contextualize :
                function(context, path) {
                    return context;
                }
        );
        
        var writer = new CueCard.IndentWriter(context);
        jsonize.converters['anything'](o, context, writer);
        
        return result;
    }

    jsonize.converters = {
        'anything': function(o, context, writer) {
            if (o == null) {
                jsonize.converters['null'](o, context, writer);
            } else if (o instanceof Array) {
                jsonize.converters['array'](o, context, writer);
            } else if (o instanceof Object) {
                jsonize.converters['object'](o, context, writer);
            } else {
                jsonize.converters[typeof o](o, context, writer);
            }
        },
        'array': function (a, context, writer) {
            var omitWhitespace = context.getProperty("omitWhitespace");
            var breakLines = context.getProperty("breakLines");
            
            if (a.length == 0) {
                writer.append('[]');
                return;
            } else if (a.length == 1) {
                if (isObject(a[0])) {
                    if (objectHasFields(a[0])) {
                        if (context.getProperty("collapseSingleObjectArray")) {
                            writer.append('[');
                            
                            var v = a[0];
                            jsonize.converters['object'](v, context, writer);
                            
                            writer.append(']');
                            return;
                        }
                    } else {
                        writer.append('[{}]');
                        return;
                    }
                }
            }
            
            writer.append('[');
            if (breakLines) {
                writer.appendLineBreak();
                writer.indent();
            } else if (!omitWhitespace) {
                writer.append(" ");
            }
            
            var l = a.length;
            for (var i = 0; i < l; i ++) {
                var v = a[i];
                var f = jsonize.converters[v == null ? 'null' : typeof v];
                if (f) {
                    if (breakLines) {
                        writer.appendIndent();
                    }
                    
                    f(v, context, writer);
                    if (i < l - 1) {
                        writer.append(',');
                    }
                    
                    if (breakLines) {
                        writer.appendLineBreak();
                    } else if (!omitWhitespace) {
                        writer.append(" ");
                    }
                }
            }
            
            if (breakLines) {
                writer.unindent();
                writer.appendIndent();
            }
            writer.append(']');
        },
        'boolean': function (x, context, writer) {
            writer.append(String(x));
        },
        'null': function (x, context, writer) {
            writer.append("null");
        },
        'undefined': function (x, context, writer) {
            writer.append("undefined");
        },
        'number': function (x, context, writer) {
            writer.append(isFinite(x) ? String(x) : "null");
        },
        'object': function (x, context, writer) {
            if (x instanceof Array) {
                jsonize.converters['array'](x, context, writer);
            } else if ("__identifier__" in x) {
                var identifier = x["__identifier__"];
                var resolve = context.getProperty("resolveVariables");
                var variables = context.getProperty("variables");
                
                if (identifier in variables) {
                    if (resolve) {
                        var v = variables[identifier];
                        jsonize.converters['anything'](v, context, writer);
                    } else {
                        writer.append(identifier);
                    }
                } else {
                    // Always turn it into a string if the identifier isn't defined.
                    jsonize.converters['anything'](identifier, context, writer);
                }
            } else {
                var contextualize = context.getRootProperty("contextualize");
                var path = context.getProperty("path");
                
                var omitWhitespace = context.getProperty("omitWhitespace");
                var breakLines = context.getProperty("breakLines");
                var alignFieldValues = context.getProperty("alignFieldValues");
                
                writer.append('{');
                if (breakLines) {
                    writer.appendLineBreak();
                    writer.indent();
                } else if (!omitWhitespace) {
                    writer.append(" ");
                }
                
                var count = 0;
                var maxFieldLength = 0;
                var fieldNameEncoder = context.getRootProperty("fieldNameEncoder");
                for (var n in x) {
                    if (x.hasOwnProperty(n)) {
                        var v = x[n];
                        count++;
                        if (!isObject(v) && (!isArray(v) || arrayIsEffectivelyEmpty(v))) {
                            maxFieldLength = Math.max(maxFieldLength, fieldNameEncoder.encode(n).length);
                        }
                    }
                }
                maxFieldLength = Math.min(maxFieldLength, context.getProperty("maxFieldLength"));
                
                for (var n in x) {
                    if (x.hasOwnProperty(n)) {
                        var v = x[n];
                        var f = jsonize.converters[v == null ? 'null' : typeof v];
                        var n2 = fieldNameEncoder.encode(n);
                    
                        if (breakLines) {
                            writer.appendIndent();
                        }
                        
                        writer.append(n2);
                        writer.append(omitWhitespace ? ":" : ": ");
                        
                        if (!omitWhitespace && breakLines && alignFieldValues && (!isObject(v) && (!isArray(v) || arrayIsEffectivelyEmpty(v)))) {
                            for (var q = n2.length; q < maxFieldLength; q++) {
                                writer.append(" ");
                            }
                        }
                        
                        path.unshift({ field: n });
                        f(v, contextualize(context, path), writer);
                        path.shift();
                        
                        count--;
                        if (count > 0) {
                            writer.append(',');
                        }
                        
                        if (breakLines) {
                            writer.appendLineBreak();
                        } else if (!omitWhitespace) {
                            writer.append(" ");
                        }
                    }
                }
                
                if (breakLines) {
                    writer.unindent();
                    writer.appendIndent();
                }
                writer.append('}');
            }
        },
        'string': function (x, context, writer) {
            writer.append('"' + context.getProperty("encodeJavascriptString")(x) + '"');
        },
        'null': function(x, context, writer) {
            writer.append('null');
        }
    };

    function dontBreakLinesForFields() {
        var m = {};
        for (var i = 0; i < arguments.length; i++) {
            m[arguments[i]] = true;
        }
        return function(context, path) {
            if (path.length > 0 && path[0].field in m) {
                var context2 = context.create();
                context2.setProperty("breakLines", false);
                return context2;
            } else {
                return context;
            }
        };
    }

    function dontBreakLinesAfterDepth(d) {
        return function(context, path) {
            if (path.length == d) {
                var context2 = context.create();
                context2.setProperty("breakLines", false);
                return context2;
            } else {
                return context;
            }
        };
    }
})();
/** queue.js **/
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

CueCard.JsonpQueue = {
    pendingCallIDs: {},
    callInProgress: 0
};

CueCard.JsonpQueue.cancelAll = function() {
    CueCard.JsonpQueue.pendingCallIDs = {};
};

CueCard.JsonpQueue.call = function(url, onDone, onError, debug) {
    if (CueCard.JsonpQueue.callInProgress == 0) {
        document.body.style.cursor = "progress";
    }
    CueCard.JsonpQueue.callInProgress++;
    
    var callbackID = new Date().getTime() + "x" + Math.floor(Math.random() * 1000);
    var script = document.createElement("script");
    script.setAttribute('onerror', 'err' + callbackID + '();');
    
    url += (url.indexOf("?") < 0 ? "?" : "&") + "callback=cb" + callbackID;
    script.setAttribute('src', url);
    
    var cleanup = function() {
        CueCard.JsonpQueue.callInProgress--;
        if (CueCard.JsonpQueue.callInProgress == 0) {
            document.body.style.cursor = "auto";
        }
        
        if (!(debug)) {
            script.parentNode.removeChild(script);
        }
        
        try {
            delete window["cb" + callbackID];
            delete window["err" + callbackID];
        } catch (e) {
            // IE doesn't seem to allow calling delete on window
            window["cb" + callbackID] = undefined;
            window["err" + callbackID] = undefined;
        }
        
        if (callbackID in CueCard.JsonpQueue.pendingCallIDs) {
            delete CueCard.JsonpQueue.pendingCallIDs[callbackID];
            return true;
        } else {
            return false;
        }
    };
    
    var callback = function(o) {
        if (cleanup()) {
            try {
                onDone(o);
            } catch (e) {
                //console.log(e);
            }
        }
    };
    var error = function() {
        if (cleanup()) {
            if (typeof onError == "function") {
                try {
                    onError(url);
                } catch (e) {
                    //console.log(e);
                }
            }
        }
    };
    
    window["cb" + callbackID] = callback;
    window["err" + callbackID] = error;
    
    CueCard.JsonpQueue.pendingCallIDs[callbackID] = true;
    document.getElementsByTagName("head")[0].appendChild(script);
};

CueCard.JsonpQueue.queryOne = function(query, onDone, onError, debug) {
    CueCard.JsonpQueue.queryOneEnvelope({ "query" : query }, onDone, onError, debug);
};

CueCard.JsonpQueue.queryOneEnvelope = function(queryEnvelope, onDone, onError, debug) {
    var q = CueCard.jsonize({ "q1" : queryEnvelope }, { breakLines: false });
    var url = CueCard.freebaseServiceUrl + 'api/service/mqlread?queries=' + encodeURIComponent(q);
    var onDone2 = function(o) {
        if (o.q1.code == "/api/status/error") {
            if (typeof onError == "function") {
                onError(o.q1);
            }
        } else {
            onDone(o.q1);
        }
    };
    var onError2 = function() {
        if (typeof onError == "function") {
            onError("Unknown");
        }
    }
    CueCard.JsonpQueue.call(url, onDone2, onError2, debug);
};

/** query-parser.js **/
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

/*----------------------------------------------------------------------
 *  QueryParser
 *----------------------------------------------------------------------
 */
CueCard.QueryParser = {};

CueCard.QueryParser.parseForContext = function(text, startIndex, cursorLine, cursorCol) {
    var tokenizer = new CueCard.QueryTokenizer(text, startIndex);
    var token = tokenizer.token();
    var lookAheads = [];
    
    var tokenTypes = CueCard.Token.Types;
    var next = function() {
        if (lookAheads.length == 0) {
            token = tokenizer.next();
        } else {
            token = lookAheads.shift();
        }
    };
    var lookAhead = function(count) { // count is 
        if (count == 0) {
            return token;
        } else {
            while (count > lookAheads.length) {
                lookAheads.push(tokenizer.next());
            }
            return lookAheads[count - 1];
        }
    };
    var eatWhitespace = function() {
        while (token != null && 
            (token.type == tokenTypes.whitespace || token.type == tokenTypes.unrecognized)) {
            next();
        }
    };
    var makePhantomToken = function(anchorToken) {
        return new CueCard.Token(
            CueCard.Token.Types.phantom, 
            "",
            anchorToken.start,
            anchorToken.start
        );
    };
    var getSafeToken = function() {
        if (token != null) {
            return token;
        } else {
            return new CueCard.Token(
                CueCard.Token.Types.phantom, 
                "",
                tokenizer.index(),
                tokenizer.index()
            );
        }
    };
    var makeMissingQueryNode = function() {
        var queryNode = new CueCard.QueryNode(CueCard.QueryNode.TYPE_MISSING);
        queryNode.startToken = queryNode.endToken = makePhantomToken(getSafeToken());
        
        return queryNode;
    };
    
    var parseTerminal = function() {
        var queryNode = new CueCard.QueryNode(CueCard.QueryNode.TYPE_TERMINAL);
        queryNode.startToken = queryNode.endToken = token;
        queryNode.isArray = false;
        if (token.type == tokenTypes.numberLiteral) {
            queryNode.value = parseFloat(token.content);
        } else if (token.type == tokenTypes.stringLiteral) {
            queryNode.value = token.content.replace(/^['"]/, '').replace(/['"]$/, '');
        } else if (token.type == tokenTypes.booleanLiteral) {
            queryNode.value = (token.content == "true" || token.content == "True");
        } else if (token.type == tokenTypes.nullLiteral) {
            queryNode.value = null;
        } else if (token.type == tokenTypes.delimiter) {
            return null;
        } else {
            queryNode.value = token.content;
        }
        next();
        
        return queryNode;
    };
    var parseTerminalArray = function() {
        var queryNode = new CueCard.QueryNode(CueCard.QueryNode.TYPE_TERMINAL);
        queryNode.startToken = token;
        queryNode.isArray = true;
        queryNode.value = [];
        
        if (token != null && token.type == tokenTypes.delimiter && token.content == "[") {
            next(); // eat the [
        }
        
        while (token != null) {
            eatWhitespace();
            if (token == null || (token.type == tokenTypes.delimiter && token.content == "]")) {
                break;
            }
            
            /*  While we should just have terminals here, the user might 
             *  put in a nonterminal, so we just have to be prudent and
             *  expect any sort of node. We can do error handling later.
             */
            var terminal = parseNode(false);
            if (terminal == null) {
                // We probably hit a delimiter like :
                break;
            }
            queryNode.value.push(terminal);
            
            eatWhitespace();
            
            // Eat the comma if any. If not, we won't be fussy about it.
            if (token != null && token.type == tokenTypes.delimiter && token.content == ",") {
                next(); // eat comma
            }
        }
        
        if (token != null && token.type == tokenTypes.delimiter && token.content == "]") {
            queryNode.endToken = token;
            next(); // eat ]
        }
        if (queryNode.endToken == null) {
            queryNode.endToken = getSafeToken();
        }
        
        return queryNode;
    };
    var parseNonTerminal = function(queryNode) {
        var queryNode = new CueCard.QueryNode(CueCard.QueryNode.TYPE_NONTERMINAL);
        queryNode.startToken = token;
        
        if (token != null && token.type == tokenTypes.delimiter && token.content == "{") {
            next(); // eat the {
        }
        while (token != null) {
            eatWhitespace();
            if (token == null) {
                break;
            }
            
            var path = null;
            var pathToken = null;
            var valueNode = null;
            
            if (token.type == tokenTypes.identifier) {
                path = token.content;
                pathToken = token;
                next();
                eatWhitespace();
            } else if (token.type == tokenTypes.stringLiteral) {
                path = token.content.replace(/^['"]/, '').replace(/['"]$/, '');
                pathToken = token;
                next();
                eatWhitespace();
            } else {
                pathToken = makePhantomToken(token);
            }
            
            if (token != null && token.type == tokenTypes.delimiter && 
                (token.content == ":" || token.content == ";")) {
                // People tend to mistype : as ;
                next(); // eat : or ;
                eatWhitespace();
            } // don't be fussy if we can't find a :
            
            if (token != null) {
                valueNode = parseNode(false);
            }
            
            if (path != null || valueNode != null) {
                var queryNodeLink = new CueCard.QueryNodeLink(
                    path != null ? path : "", 
                    pathToken
                );
                queryNodeLink.value = valueNode != null ? valueNode : makeMissingQueryNode();
                
                queryNode.links.push(queryNodeLink);
            }
            
            eatWhitespace();
            if (token == null || 
                (token.type == tokenTypes.delimiter && 
                    (token.content == "}" || token.content == "]"))) {
                break;
            }
            
            if (token.type == tokenTypes.delimiter &&
                token.content == ",") {
                next(); // eat comma
            }
        }
        
        if (token != null && token.type == tokenTypes.delimiter && token.content == "}") {
            queryNode.endToken = token;
            next(); // eat }
        }
        if (queryNode.endToken == null) {
            queryNode.endToken = getSafeToken();
        }
        
        return queryNode;
    };
    var parseNonTerminalArray = function() {
        var queryNode = new CueCard.QueryNode(CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY);
        queryNode.startToken = token;
        queryNode.elements = [];
        
        // We need to check this because we might be called when the user forgets [
        if (token != null && token.type == tokenTypes.delimiter && token.content == "[") {
            next(); // eat the [
        }
        
        while (token != null) {
            eatWhitespace();
            if (token == null || (token.type == tokenTypes.delimiter && token.content == "]")) {
                break;
            }
            
            queryNode.elements.push(parseNonTerminal());
            
            eatWhitespace();
            
            // Eat the comma if any. If not, we won't be fussy about it.
            if (token != null && token.type == tokenTypes.delimiter && token.content == ",") {
                next(); // eat comma
            }
        }
        
        if (token != null && token.type == tokenTypes.delimiter && token.content == "]") {
            queryNode.endToken = token;
            next(); // eat ]
        }
        if (queryNode.endToken == null) {
            queryNode.endToken = getSafeToken();
        }
        
        return queryNode;
    };
    var parseTerminalArrayOrNonTerminalArray = function() {
        var look = 1;
        var token2;
        while ((token2 = lookAhead(look)) != null && 
            (token2.type == tokenTypes.whitespace || token2.type == tokenTypes.unrecognized)) {
            look++;
        }
        
        if (token2 != null) {
            if (token2.type == tokenTypes.delimiter && token2.content == "{") {
                return parseNonTerminalArray();
            } else if (token2.type == tokenTypes.identifier || token2.type == tokenTypes.stringLiteral) {
                // Keep on looking for :
                look++;
                while ((token2 = lookAhead(look)) != null && 
                    (token2.type == tokenTypes.whitespace || token2.type == tokenTypes.unrecognized)) {
                    look++;
                }
                
                if (token2 != null && token2.type == tokenTypes.delimiter && token2.content == ":") {
                    return parseNonTerminalArray();
                }
            }
        }
        
        return parseTerminalArray();
    };
    var parseNode = function(forceNonTerminal) {
        eatWhitespace();
        
        if (token == null) {
            return makeMissingQueryNode();
        } else if (token.type == tokenTypes.delimiter) {
            if (token.content == "[") {
                return parseTerminalArrayOrNonTerminalArray();
            } else if (token.content == "{") {
                return parseNonTerminal();
            } else {
                return makeMissingQueryNode();
            }
        } else if (forceNonTerminal) {
            // It is safest to assume that the user meant [{ }];
            return parseNonTerminalArray();
        } else {
            return parseTerminal();
        }
    };
    
    var cursorBeforeStart = function(token) {
        return cursorLine < token.start.line ||
            (cursorLine == token.start.line && cursorCol <= token.start.col);
    };
    var cursorAfterStart = function(token) {
        return cursorLine > token.start.line ||
            (cursorLine == token.start.line && cursorCol >= token.start.col);
    };
    var cursorBeforeEnd = function(token) {
        return cursorLine < token.end.line ||
            (cursorLine == token.end.line && cursorCol <= token.end.col);
    };
    var cursorBeforeStart = function(token) {
        return cursorLine < token.start.line ||
            (cursorLine == token.start.line && cursorCol <= token.start.col);
    };
    var cursorWithinNode = function(node) {
        return node.startToken == node.endToken ?
            (cursorAfterStart(node.startToken) && cursorBeforeEnd(node.startToken)) :
            (cursorAfterStart(node.startToken) && cursorBeforeStart(node.endToken));
    };
    var resolveNode = function(node, indices) {
        if (node.type == CueCard.QueryNode.TYPE_TERMINAL) {
            if (node.isArray) {
                for (var i = 0; i < node.value.length; i++) {
                    var childNode = node.value[i];
                    if (cursorBeforeStart(childNode.startToken)) {
                        indices.push({ child: i, relative: "before", node: node });
                        return;
                    } else if (cursorWithinNode(childNode)) {
                        indices.push({ child: i, relative: "inside", node: node });
                        resolveNode(childNode, indices);
                        return;
                    }
                }
                indices.push({ child: node.value.length, relative: "before", node: node });
            } else {
                indices.push({ token: node.startToken, node: node, offset: cursorCol - node.startToken.start.col });
            }
        } else if (node.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY) {
            for (var i = 0; i < node.elements.length; i++) {
                var childNode = node.elements[i];
                if (cursorBeforeStart(childNode.startToken)) {
                    indices.push({ child: i, relative: "before", node: node });
                    return;
                } else if (cursorWithinNode(childNode)) {
                    indices.push({ child: i, relative: "inside", node: node });
                    resolveNode(childNode, indices);
                    return;
                }
            }
            indices.push({ child: node.elements.length, relative: "before", node: node });
        } else if (node.type == CueCard.QueryNode.TYPE_NONTERMINAL) {
            for (var i = 0; i < node.links.length; i++) {
                var link = node.links[i];
                if (cursorBeforeStart(link.token)) {
                    indices.push({ child: i, relative: "before", node: node });
                    return;
                } else if (cursorBeforeEnd(link.token)) {
                    indices.push({ child: i, relative: "path", node: node, offset: cursorCol - link.token.start.col });
                    return;
                } else if (!cursorAfterStart(link.value.startToken)) {
                    indices.push({ child: i, relative: "space", node: node });
                    return;
                } else if (cursorBeforeEnd(link.value.endToken)) {
                    indices.push({ child: i, relative: "inside", node: node });
                    resolveNode(link.value, indices);
                    return;
                }
            }
            indices.push({ child: node.links.length, relative: "before", node: node });
        } else {
            indices.push({ token: node.startToken, node: node });
        }
    };
    
    eatWhitespace();
    var result = { model: parseNode(true), context: [] };
    resolveNode(result.model, result.context);
    
    return result;
};

/*----------------------------------------------------------------------
 *  QueryTokenizer and token stuff
 *----------------------------------------------------------------------
 */
CueCard.QueryTokenizer = function(text, startIndex) {
    this._text = text + " "; // make it easier to parse
    this._maxIndex = text.length;
    this._index = startIndex;
    this._line = 0;
    this._col = 0;
    
    this.next();
};

CueCard.QueryTokenizer.prototype.token = function() {
    return this._token;
};

CueCard.QueryTokenizer.prototype.index = function() {
    return this._index;
};

CueCard.QueryTokenizer._whitespaces = " \t\r\n";

CueCard.QueryTokenizer.prototype.next = function() {
    this._token = null;
    
    if (this._index < this._maxIndex) {
        var c1 = this._text.charAt(this._index);
        var c2 = this._text.charAt(this._index + 1);
        var self = this;
        
        function advance() {
            self._index++;
            self._col++;
        }
        function makeCurrentPos() {
            return new CueCard.TokenPos(self._index, self._line, self._col);
        };
        function makeCurrentPosAndIncrement() {
            var pos = makeCurrentPos();
            advance();
            return pos;
        };
        function makeSimpleToken(type, startPos, text) {
            var endPos = makeCurrentPos();
            self._pos = endPos;
            self._token = new CueCard.Token(
                type, 
                text || self._text.substring(startPos.offset, endPos.offset),
                startPos,
                endPos
            );
        };
        
        function parseWhitespace() {
            var startPos = makeCurrentPos();
            while (self._index < self._maxIndex) {
                var c = self._text.charAt(self._index);
                if (CueCard.QueryTokenizer._whitespaces.indexOf(c) < 0) {
                    break;
                }
                
                if (c == "\n") {
                    self._line++;
                    self._col = 0;
                } else {
                    self._col++;
                }
                self._index++;
            }
            makeSimpleToken(CueCard.Token.Types.whitespace, startPos);
        };
        
        function parseString(opener) {
            var startPos = makeCurrentPos();
            
            if (c1 == 'u') {
                advance();
            }
            advance();
            
            var text = "";
            while (self._index < self._maxIndex) {
                c1 = self._text.charAt(self._index);
                if (c1 == opener) {
                    advance();
                    break;
                } else if (c1 == '\r' || c1 == '\n') {
                    break;
                }
                
                if (c1 == "\\") {
                    advance();
                    text += self._text.charAt(self._index);
                } else {
                    text += c1;
                }
                advance();
            }
            
            makeSimpleToken(CueCard.Token.Types.stringLiteral, startPos, text);
        };
        
        function parseNumber() {
            var startPos = makeCurrentPos();
            
            var sign = 1;
            if (c1 == '+') {
                advance();
            } else if (c1 == '-') {
                advance();
                sign = -1;
            }
            
            while (self._index < self._maxIndex &&
                   CueCard.QueryTokenizer._isDigit(self._text.charAt(self._index))) {
                advance();
            }
            
            if (self._index < self._maxIndex &&
                self._text.charAt(self._index) == '.') {
                
                advance();
                
                while (self._index < self._maxIndex &&
                       CueCard.QueryTokenizer._isDigit(self._text.charAt(self._index))) {
                    advance();
                }
            }
            
            if (self._index < self._maxIndex &&
                self._text.charAt(self._index) == 'e') {
                
                advance();
                
                c1 = self._text.charAt(self._index);
                if (c1 == '+' || c1 == '-') {
                    advance();
                }
                
                while (self._index < self._maxIndex &&
                       CueCard.QueryTokenizer._isDigit(self._text.charAt(self._index))) {
                    advance();
                }
            }
            
            makeSimpleToken(CueCard.Token.Types.numberLiteral, startPos);
        };
        
        function parseIdentifier() {
            var startPos = makeCurrentPos();
            while (self._index < self._maxIndex &&
                    CueCard.QueryTokenizer._identifierPrefix.indexOf(self._text.charAt(self._index)) >= 0) {
                advance();
            }
            
            var hasSuffix = false;
            if (self._index < self._maxIndex - 2) {
                var s = self._text.substr(self._index, 2);
                if (s == ">=" || s == "<=" || s == "~=") {
                    advance();
                    advance();
                    hasSuffix = true;
                }
            }
            if (!hasSuffix && self._index < self._maxIndex - 1) {
                var s = self._text.substr(self._index, 1);
                if (s == ">" || s == "<") {
                    advance();
                    hasSuffix = true;
                }
            }
            
            var endPos = makeCurrentPos();
            var content = self._text.substring(startPos.offset, endPos.offset);
            self._pos = endPos;
            if (content == "null" || content == "None") {
                self._token = new CueCard.Token(
                    CueCard.Token.Types.nullLiteral, 
                    content,
                    startPos,
                    endPos
                );
            } else if (content == "true" || content == "True" || content == "false" || content == "False") {
                self._token = new CueCard.Token(
                    CueCard.Token.Types.booleanLiteral, 
                    content,
                    startPos,
                    endPos
                );
            } else {
                self._token = new CueCard.Token(
                    CueCard.Token.Types.identifier, 
                    content,
                    startPos,
                    endPos
                );
            }
        };
        
        if (CueCard.QueryTokenizer._whitespaces.indexOf(c1) >= 0) {
            parseWhitespace();
        } else if ("[{}],:".indexOf(c1) >= 0) {
            makeSimpleToken(CueCard.Token.Types.delimiter, makeCurrentPosAndIncrement());
        } else if (c1 == '"' || c1 == "'") {
            parseString(c1);
        } else if (c1 == 'u' && (c2 == '"' || c2 == "'")) {
            parseString(c2);
        } else if (c1 == "-" || c1 == "+" || CueCard.QueryTokenizer._isDigit(c1)) {
            parseNumber();
        } else if (c1 == "*") {
            makeSimpleToken(CueCard.Token.Types.identifier, makeCurrentPosAndIncrement());
        } else if (CueCard.QueryTokenizer._identifierPrefix.indexOf(c1) >= 0) {
            parseIdentifier();
        } else {
            makeSimpleToken(CueCard.Token.Types.unrecognized, makeCurrentPosAndIncrement());
        }
    }
    
    return this._token;
};

CueCard.QueryTokenizer._isDigit = function(c) {
    return "0123456789".indexOf(c) >= 0;
};

CueCard.QueryTokenizer._identifierPrefix = "#!/_-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

CueCard.TokenPos = function(offset, line, col) {
    this.offset = offset;
    this.line = line;
    this.col = col;
}

CueCard.Token = function(type, content, start, end) {
    this.type = type;
    this.content = content;
    this.start = start;
    this.end = end;
};

CueCard.Token.Types = {
    unrecognized:       -1,
    phantom:            0,  // for internal marking only
    whitespace:         1,
    delimiter:          2,  // including [{}],:
    nullLiteral:        3,
    numberLiteral:      4,
    stringLiteral:      5,
    booleanLiteral:     6,
    identifier:         7
};
/** query-model.js **/
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

/*----------------------------------------------------------------------
 *  QueryNode
 *----------------------------------------------------------------------
 */
CueCard.QueryNode = function(type) {
    this.type = type;
    
    this.value = null;      // only for terminal case
    this.isArray = false;
    
    /*  These should be the same for terminal and missing cases, 
        different for non-terminal case.
    */
    this.startToken = null; 
    this.endToken = null;
    
    this.links = []; // only for non-terminal case
};

CueCard.QueryNode.TYPE_MISSING = -1;            // where a node should be but there is none
CueCard.QueryNode.TYPE_TERMINAL = 0;            // null, string, number, boolean, simple array
CueCard.QueryNode.TYPE_NONTERMINAL = 1;         // object hash {...}
CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY = 2;   // array of one or more object hashes: [{...}, ...]

CueCard.QueryNode.prototype.toQueryJson = function(options) {
    options = options || {};
    if (!("qualifyAllProperties" in options)) {
        options.qualifyAllProperties = false;
    }
    if (!("excludeChild" in options)) {
        options.excludeChild = -1;
    }
    return this._toQueryJson(options);
};

CueCard.QueryNode.prototype._toQueryJson = function(options) {
    var childOptions = {
        qualifyAllProperties: options.qualifyAllProperties,
        excludeChild: -1
    };
    if (this.type == CueCard.QueryNode.TYPE_TERMINAL) {
        if (this.isArray) {
            var a = [];
            for (var i = 0; i < this.value.length; i++) {
                var v = this.value[i];
                a.push(v != null ? v._toQueryJson(childOptions) : null);
            }
            return a;
        } else {
            if (this.startToken.type == CueCard.Token.Types.identifier) {
                return { "__identifier__" : this.value };
            } else {
                return this.value;
            }
        }
    } else if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY) {
        var a = [];
        for (var i = 0; i < this.elements.length; i++) {
            a.push(this.elements[i]._toQueryJson(childOptions));
        }
        return a;
    } else if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL) {
        var o = {};
        var hasAnyType = false;
        
        var ns = 0;
        for (var i = 0; i < this.links.length; i++) {
            if (i != options.excludeChild) {
                var link = this.links[i];
                if (link.path.length > 0) {
                    var path = link.getPath(options.qualifyAllProperties);
                    if (path in o && link.namespace.length == 0) {
                        while (path in o) {
                            link.namespace = "ns" + ns++ + ":";
                            path = link.getPath(options.qualifyAllProperties);
                        }
                    }
                    
                    var value = link.value != null ? link.value._toQueryJson(childOptions) : null;
                    o[path] = value;
                    
                    if (link.getUnnamespacedQualifiedPath() == "/type/object/type" && value != null && (!(value instanceof Array) || value.length > 0)) {
                        hasAnyType = true;
                    }
                }
            }
        }
        
        if (!hasAnyType && "expectedTypes" in options && options.expectedTypes.length > 0) {
            var expectedTypes = [];
            for (var i = 0; i < options.expectedTypes.length; i++) {
                var t = options.expectedTypes[i];
                if (t != "/type/object" && t != "/common/topic") {
                    expectedTypes.push(t);
                }
            }
            
            if (expectedTypes.length == 1) {
                o["type"] = expectedTypes[0];
            } else if (expectedTypes.length > 1) {
                o["type|="] = expectedTypes;
            }
        }
        
        return o;
    } else {
        return null;
    }
};

CueCard.QueryNode.isMqlKeyword = function(s) {
    switch (s) {
    case "limit":
    case "sort":
    case "*":
    case "return":
    case "count":
    case "estimate-count":
    case "optional":
    case "create":
    case "connect":
        return true;
    }
    return false;
};

CueCard.QueryNode.prototype.getDeclaredTypes = function(types) {
    var links = null;
    if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL) {
        links = this.links;
    } else if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY) {
        links = this.elements[0].links;
    }
    if (links != null) {
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            if (link.qualifiedProperty == "/type/object/type" && !link.reverse) {
                link.getValuesOfType(types, "string");
            }
        }
    }
};

CueCard.QueryNode.prototype.getDeclaredIDs = function(ids) {
    var links = null;
    if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL) {
        links = this.links;
    } else if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY) {
        links = this.elements[0].links;
    }
    if (links != null) {
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            if (link.qualifiedProperty == "/type/object/id" && !link.reverse) {
                link.getValuesOfType(ids, "string");
            }
        }
    }
};

CueCard.QueryNode.prototype.getDeclaredGUIDs = function(guids) {
    var links = null;
    if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL) {
        links = this.links;
    } else if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY) {
        links = this.elements[0].links;
    }
    if (links != null) {
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            if (link.qualifiedProperty == "/type/object/guid" && !link.reverse) {
                link.getValuesOfType(guids, "string");
            }
        }
    }
};

CueCard.QueryNode.prototype.qualifyAllProperties = function(cont) {
    this._qualifyAllProperties([], {}, cont);
};

CueCard.QueryNode.prototype._qualifyAllProperties = function(expectedTypes, globalPropertyMap, cont) {
    if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL) {
        var nonTerminalLinks = [];
        var hasLinksToQualify = false;
        
        var types = [];
        var ids = [];
        var guids = [];
        
        for (var i = 0; i < this.links.length; i++) {
            var link = this.links[i];
            if (link.value.type == CueCard.QueryNode.TYPE_NONTERMINAL ||
                link.value.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY ||
                link.value.type == CueCard.QueryNode.TYPE_MISSING) {
                nonTerminalLinks.push(link);
            }
            
            if (link.qualifiedProperty == "/type/object/type" && !link.reverse) {
                link.getValuesOfType(types, "string");
            } else if (link.qualifiedProperty == "/type/object/id" && !link.reverse) {
                link.getValuesOfType(ids, "string");
            } else if (link.qualifiedProperty == "/type/object/guid" && !link.reverse) {
                link.getValuesOfType(guids, "string");
            } else if (link.qualifiedProperty != null && link.qualifiedProperty.length > 0) {
                var slash = link.qualifiedProperty.lastIndexOf("/");
                if (slash > 0) {
                    // Cheap way to get types from fully qualified properties
                    types.push(link.qualifiedProperty.substr(0, slash));
                }
            } else if (!CueCard.QueryNode.isMqlKeyword(link.property)) {
                hasLinksToQualify = true;
            }
        }
        types = types.concat(expectedTypes);
        
        /*
         *  Eliminate duplicates
         */
        var typeMap = {};
        for (var i = types.length - 1; i >= 0; i--) {
            typeMap[types[i]] = true;
        }
        types = [];
        for (var t in typeMap) {
            types.push(t);
        }
        
        /*
         *  nonTerminalLinks keeps track of inner query nodes that
         *  are non-terminals, whose properties may need to be qualified.
         */
        if (!hasLinksToQualify && nonTerminalLinks.length == 0) {
            cont.onDone(globalPropertyMap);
            return;
        }
        
        var self = this;
        var onGotSchemaData = function(o) {
            var propertyMap = o.properties;
            var qualificationMap = o.qualifications;
            
            for (var i = 0; i < self.links.length; i++) {
                var link = self.links[i];
                if (link.qualifiedProperty.length == 0 && !CueCard.QueryNode.isMqlKeyword(link.property)) {
                    link.qualifiedProperty = qualificationMap[link.property] || link.property;
                }
            }
            for (var n in propertyMap) {
                globalPropertyMap[n] = propertyMap[n];
            }
            
            (function() {
                if (nonTerminalLinks.length == 0) {
                    cont.onDone(globalPropertyMap);
                } else {
                    var nonTerminalLink = nonTerminalLinks.shift();
                    var linkExpectedTypes = [];
                    
                    if (nonTerminalLink.qualifiedProperty in propertyMap) {
                        var expectedTypes2 = propertyMap[nonTerminalLink.qualifiedProperty].expectedTypes;
                        for (var t = 0; t < expectedTypes2.length; t++) {
                            linkExpectedTypes.push(expectedTypes2[t].id);
                        }
                    }
                    linkExpectedTypes.push("/common/topic");
                    linkExpectedTypes.push("/type/object");
                    
                    if (nonTerminalLink.value.type == CueCard.QueryNode.TYPE_NONTERMINAL) {
                        nonTerminalLink.value.expectedTypes = linkExpectedTypes;
                    } else if (nonTerminalLink.value.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY) {
                        var elements = nonTerminalLink.value.elements;
                        for (var n = 0; n < elements.length; n++) {
                            elements[n].expectedTypes = linkExpectedTypes;
                        }
                    }
                    
                    nonTerminalLink.value._qualifyAllProperties(
                        linkExpectedTypes, 
                        globalPropertyMap,
                        { onDone: arguments.callee, onError: cont.onError }
                    );
                }
            })();
        };
        
        var params = [];
        if (types.length > 0) {
            params.push("t=" + encodeURIComponent(types.join(",")));
        }
        if (ids.length > 0) {
            params.push("i=" + encodeURIComponent(ids.join(",")));
        }
        if (guids.length > 0) {
            params.push("g=" + encodeURIComponent(guids.join(",")));
        }
        var url = CueCard.helper + "qualify-properties?" + params.join("&");
            
        CueCard.JsonpQueue.call(
            url,
            onGotSchemaData,
            cont.onError
        );
        
    } else if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY) {
        var i = 0;
        var elements = this.elements;
        var next = function() {
            if (i < elements.length) {
                elements[i++]._qualifyAllProperties(
                    expectedTypes, 
                    globalPropertyMap,
                    { onDone: arguments.callee, onError: cont.onError }
                );
            } else {
                cont.onDone(globalPropertyMap);
            }
        };
        next();
    } else {
        cont.onDone();
    }
};

CueCard.QueryNode.prototype.getCursorFromContext = function(context) {
    return this._getCursorFromContext(context, 0);
};

CueCard.QueryNode.prototype._getCursorFromContext = function(context, index) {
    var contextNode = context[index];
    if (this.type == CueCard.QueryNode.TYPE_MISSING) {
        var token = this.startToken;
        return {
            line: token.start.line,
            col: token.start.col
        };
    } else if (this.type == CueCard.QueryNode.TYPE_TERMINAL) {
        if (this.isArray) {
            if (contextNode.relative == "inside") {
                if (contextNode.child < this.value.length) {
                    return this.value[contextNode.child]._getCursorFromContext(context, index + 1);
                } else {
                    var token = this.endToken;
                    return {
                        line: token.start.line,
                        col: token.start.col
                    };
                }
            } else if (contextNode.child < this.value.length) {
                var childNode = this.value[contextNode.child];
                var token = childNode.startToken;
                return {
                    line: token.start.line,
                    col: token.start.col
                };
            } else {
                var token = this.startToken;
                return {
                    line: token.end.line,
                    col: token.end.col
                };
            }
        } else {
            var token = this.startToken;
            return {
                line: token.start.line,
                col: token.start.col + ("offset" in contextNode ? contextNode.offset : 0)
            };
        }
    } else if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY) {
        if (contextNode.relative == "inside") {
            if (contextNode.child < this.elements.length) {
                return this.elements[contextNode.child]._getCursorFromContext(context, index + 1);
            } else {
                var token = this.endToken;
                return {
                    line: token.start.line,
                    col: token.start.col
                };
            }
        } else if (contextNode.child < this.elements.length) {
            var childNode = this.elements[contextNode.child];
            var token = childNode.startToken;
            return {
                line: token.start.line,
                col: token.start.col
            };
        } else {
            var token = this.startToken;
            return {
                line: token.end.line,
                col: token.end.col
            };
        }    
    } else { // TYPE_NONTERMINAL
        if (contextNode.relative == "inside") {
            if (contextNode.child < this.links.length) {
                return this.links[contextNode.child].value._getCursorFromContext(context, index + 1);
            } else {
                var token = this.endToken;
                return {
                    line: token.start.line,
                    col: token.start.col
                };
            }
        } else if (contextNode.relative == "before") {
            if (contextNode.child < this.links.length) {
                var childNode = this.links[contextNode.child].value;
                var token = childNode.startToken;
                return {
                    line: token.start.line,
                    col: token.start.col
                };
            } else {
                var token = this.startToken;
                return {
                    line: token.end.line,
                    col: token.end.col
                };
            }
        } else { // relative is "path" or "space"
            if (contextNode.child < this.links.length) {
                if (contextNode.relative == "path") {
                    var token = this.links[contextNode.child].token;
                    return {
                        line: token.start.line,
                        col: token.start.col + ("offset" in contextNode ? contextNode.offset : 0)
                    };
                } else {
                    var token = this.links[contextNode.child].value.startToken;
                    return {
                        line: token.start.line,
                        col: token.start.col
                    };
                }
            } else {
                var token = this.endToken;
                return {
                    line: token.end.line,
                    col: token.end.col
                };
            }            
        }
    }
};

CueCard.QueryNode.prototype.toInsideOutQueryJson = function(cursorContext, cont) {
    var self = this;
    this.qualifyAllProperties({
        onDone: function() {
            cont.onDone(self._toInsideOutQueryJson(cursorContext, 0, null, null));
        },
        onError: cont.onError
    });
};

CueCard.QueryNode.prototype._toInsideOutQueryJson = function(cursorContext, contextIndex, nestedPath, nestedValue) {
    if (nestedPath != null && !(nestedValue instanceof Array)) {
        nestedValue = [ nestedValue ];
    }
    
    if (contextIndex < cursorContext.length) {
        var contextNode = cursorContext[contextIndex];
        
        if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL) {
            if ("child" in contextNode && contextNode.relative == "inside") {
                var childIndex = contextNode.child;
                if (childIndex < this.links.length) {
                    var link = this.links[childIndex];
                    if (link.value.type == CueCard.QueryNode.TYPE_NONTERMINAL ||
                        link.value.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY) {
                        
                        var path = link.getInverseQualifiedPath();
                        var outer = this.toQueryJson({ excludeChild: childIndex });
                        
                        if (nestedPath != null) {
                            if (outer instanceof Array) {
                                outer[0][nestedPath] = nestedValue;
                            } else {
                                outer[nestedPath] = nestedValue;
                            }
                        }
                        return link.value._toInsideOutQueryJson(cursorContext, contextIndex + 1, path, outer);
                    }
                }
            }
        } else if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY) {
            if ("child" in contextNode && contextNode.relative == "inside") {
                var childIndex = contextNode.child;
                if (this.elements.length > 1) {
                    throw new Error("Cannot turn a query inside out if a query node has siblings");
                } else if (childIndex == 0) {
                    var o = this.elements[childIndex]._toInsideOutQueryJson(
                        cursorContext, 
                        contextIndex + 1, 
                        nestedPath, 
                        nestedValue
                    );
                    return (o instanceof Array) ? o : [o];
                } else {
                    return null; // ???
                }
            }
        }
    }
    
    var o = this.toQueryJson({ expectedTypes : ("expectedTypes" in this) ? this.expectedTypes : [] });
    if (nestedPath != null) {
        if (typeof o == Array) {
            o[0][nestedPath] = nestedValue;
        } else {
            o[nestedPath] = nestedValue;
        }
    }
    return o;
};

CueCard.QueryNode.prototype.locateInnerMostNonTerminal = function(cursorContext, cont) {
    var self = this;
    this.qualifyAllProperties({
        onDone: function() {
            var r = self._locateInnerMostNonTerminal(cursorContext, 0);
            cont.onDone(r != null ? r : { node: self, property: null, reverse: false });
        },
        onError: cont.onError
    });
};

CueCard.QueryNode.prototype._locateInnerMostNonTerminal = function(cursorContext, contextIndex) {
    if (contextIndex < cursorContext.length) {
        var contextNode = cursorContext[contextIndex];
        
        if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL) {
            if ("child" in contextNode && contextNode.relative == "inside") {
                var childIndex = contextNode.child;
                if (childIndex < this.links.length) {
                    var link = this.links[childIndex];
                    if (link.value.type == CueCard.QueryNode.TYPE_NONTERMINAL || 
                        link.value.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY) {
                        var r = link.value._locateInnerMostNonTerminal(cursorContext, contextIndex + 1);
                        if (r == null) {
                            r = { node: link.value }
                        }
                        if (!("property" in r)) {
                            r.property = link.qualifiedProperty;
                            r.reverse = link.reverse;
                        }
                        return r;
                    }
                }
            }
        } else if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY) {
            if ("child" in contextNode && contextNode.relative == "inside") {
                var childIndex = contextNode.child;
                if (childIndex < this.elements.length) {
                    var child = this.elements[childIndex];
                    var r = child._locateInnerMostNonTerminal(cursorContext, contextIndex + 1);
                    if (r == null) {
                        r = { node: child };
                    }
                    return r;
                }
            }
        }
    }
    return null;
};

/*----------------------------------------------------------------------
 *  QueryNodeLink
 *----------------------------------------------------------------------
 */
CueCard.QueryNodeLink = function(path, token) {
    this.path = path;
    this.token = token;
    
    this.reverse = false;
    this.namespace = "";
    this.property = "";             // only the short key
    this.originalProperty = "";     // might be fully qualified, or might be a short key
    this.qualifiedProperty = "";
    this.suffix = "";
    this.value = null;
    
    if (path.length > 0) {
        if (path.charAt(0) == "!") {
            this.reverse = true;
            path = path.substr(1);
        }
    }
    if (path.length > 0) {
        var colon = path.indexOf(":");
        if (colon >= 0) {
            this.namespace = path.substr(0, colon + 1);
            path = path.substr(colon + 1);
            
            // Check for ! again in case the user type ns:!/...
            if (path.length > 0 && path.charAt(0) == "!") {
                this.reverse = true;
                path = path.substr(1);
            }
        }
    }
    if (path.length >= 2) {
        var suffix = path.substr(path.length - 2);
        if (suffix == ">=" || suffix == "<=" || suffix == "~=") {
            this.suffix = suffix;
            path = path.substr(0, path.length - 2);
        }
    }
    if (path.length > 1 && this.suffix == "") {
        var suffix = path.substr(path.length - 1);
        if (suffix == "<" || suffix == ">") {
            this.suffix = suffix;
            path = path.substr(0, path.length - 1);
        }
    }
    
    this.originalProperty = path;
    
    if (path.length > 0) {
        if (path.charAt(0) == "/") {
            this.qualifiedProperty = path;
            
            var lastSlash = path.lastIndexOf("/");
            this.property = path.substr(lastSlash + 1);
        } else {
            this.property = path;
        }
    }
    // temp
    if (this.qualifiedProperty == "") {
        if (this.property == "type") {
            this.qualifiedProperty = "/type/object/type";
        } else if (this.property == "id") {
            this.qualifiedProperty = "/type/object/id";
        } else if (this.property == "guid") {
            this.qualifiedProperty = "/type/object/guid";
        } else if (this.property == "name") {
            this.qualifiedProperty = "/type/object/name";
        } else if (this.property == "lang") {
            this.qualifiedProperty = "/type/text/lang";
        } else if (CueCard.QueryNode.isMqlKeyword(this.property)) {
            this.qualifiedProperty = this.property;
        }
    }
};

CueCard.QueryNodeLink.prototype.getQualifiedPath = function() {
    return (this.reverse ? "!" : "") + this.namespace + this.qualifiedProperty + this.suffix;
};

CueCard.QueryNodeLink.prototype.getInverseQualifiedPath = function() {
    return (this.reverse ? "" : "!") + this.namespace + this.qualifiedProperty + this.suffix;
};

CueCard.QueryNodeLink.prototype.getUnnamespacedQualifiedPath = function() {
    return (this.reverse ? "!" : "") + this.qualifiedProperty + this.suffix;
};

CueCard.QueryNodeLink.prototype.getPath = function(qualify) {
    var p = (qualify && this.qualifiedProperty.length > 0) ? this.qualifiedProperty : this.originalProperty;
    return (this.reverse ? "!" : "") + this.namespace + p + this.suffix;
};

CueCard.QueryNodeLink.prototype.getValuesOfType = function(results, type) {
    var getLiterals = function(terminalNode) {
        if (terminalNode.isArray) {
            var arrayElements = terminalNode.value;
            for (var j = 0; j < arrayElements.length; j++) {
                var arrayElement = arrayElements[j];
                if (arrayElement.type == CueCard.QueryNode.TYPE_TERMINAL && 
                    arrayElement.value != null && 
                    typeof arrayElement.value == type) {
                    
                    results.push(arrayElement.value);
                }
            }
        } else if (terminalNode.value != null && typeof terminalNode.value == type) {
            results.push(terminalNode.value);
        }
    };
    
    var linkValue = this.value;
    if (linkValue.type == CueCard.QueryNode.TYPE_TERMINAL) {
        getLiterals(linkValue);
    } else if (linkValue.type == CueCard.QueryNode.TYPE_NONTERMINAL || 
                linkValue.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY) {
        var links = linkValue.type == CueCard.QueryNode.TYPE_NONTERMINAL ? linkValue.links : linkValue.elements[0].links;
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            if (link.qualifiedProperty == "/type/value/value" && 
                link.value.type == CueCard.QueryNode.TYPE_TERMINAL) {
                getLiterals(link.value);
            }
        }
    }
};
/** ui.js **/
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

CueCard.UI = {};

CueCard.UI.reportError = function(msg) {
    try {
        console.log(msg);
    } catch (e) {
        alert(msg);
    }
};

CueCard.UI.createBlockingContinuations = function(onDone, onError) {
    return new CueCard.UI.Cont(onDone, onError);
};

CueCard.UI.Cont = function(onDone, onError) {
    var self = this;
    
    this._onDone = onDone;
    this._onError = onError || CueCard.UI.reportError;
    this._progressUI = null;
    
    this._canceled = false;
    this._cleanedUp = false;
    
    this.cleanUp = function() {
        if (!self._cleanedUp) {
            self._cleanedUp = true;
            if (self._progressUI != null) {
                self._progressUI.remove();
                self._progressUI = null;
            }
        }
    };
    this.cancel = function() {
        if (!self._canceled) {
            self._canceled = true;
            self.cleanUp();
        }
    };
    this.onError = function() {
        self.cleanUp();
        self._onError();
    };
    this.onDone = function() {
        var delayCleanUp = false;
        if (!self._canceled) {
            var args = [ self ];
            for (var i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            delayCleanUp = self._onDone.apply(null, args);
        }
        
        if (!(delayCleanUp)) {
            self.cleanUp();
        }
    };
    
    window.setTimeout(function() {
        if (!self._cleanedUp) {
            self._progressUI = $('<div class="cuecard-progress">Working...</div>').appendTo($(document.body));
        }
    }, 300);
};

CueCard.UI.Cont.prototype.isCanceled = function() {
    return this._canceled;
};

CueCard.UI.Cont.prototype.extend = function(onDone, onError) {
    this._onDone = onDone;
    this._onError = onError || this._onError;
    return this;
};

/** popup.js **/
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

CueCard.Popup = function(left, top, height, windows, handlers) {
    this._left = left;
    this._top = top;
    this._height = height;
    this._windows = windows;
    this._handlers = handlers || {};
    
    this._pendingContinuations = [];
    
    this.elmt = $('<div class="cuecard-popup-container"></div>')
        .css("top", (this._top + this._height) + "px")
        .css("left", this._left + "px")
        .appendTo('body');
        
    this._addEventHandlers();
};

CueCard.Popup.prototype.addPendingContinuation = function(cont) {
    this._pendingContinuations.push(cont);
};

CueCard.Popup.prototype.reposition = function() {
    var ourHeight = this.elmt.height();
    var ourWidth = this.elmt.width();
    
    if (this._top + this._height + ourHeight >= $(window).height()) {
        this.elmt.css("top", (this._top - ourHeight - 5) + "px");
    } else {
        this.elmt.css("top", (this._top + this._height) + "px");
    }
    if (this._left + ourWidth >= $(window).width()) {
        this.elmt.css("left", ($(window).width() - ourWidth - 25) + "px");
    } else {
        this.elmt.css("left", (this._left) + "px");
    }
};

CueCard.Popup.prototype.close = function() {
    this._remove();
    this._pendingContinuations = null;
};

CueCard.Popup.prototype.cancel = function() {
    if (this.elmt != null) {
        this._remove();
        this._cancelPendingContinuations();
        this._pendingContinuations = null;
    }
};

CueCard.Popup.prototype._remove = function() {
    this._removeEventHandlers();
    
    this.elmt.remove();
    this.elmt = null;
};

CueCard.Popup.prototype._cancelPendingContinuations = function() {
    for (var i = 0; i < this._pendingContinuations.length; i++) {
        try {
            this._pendingContinuations[i].cancel();
        } catch (e) {
            //console.log(e);
        }
    }
    this._pendingContinuations = [];
};

CueCard.Popup.prototype._addEventHandlers = function() {
    var self = this;
    this._handleKeyDown = function(evt) {
        return self._onKeyDown(evt);
    };
    this._handleMouseDown = function(evt) {
        return self._onMouseDown(evt);
    };
    
    for (var i = 0; i < this._windows.length; i++) {
        var win = this._windows[i];
        try {
            $(win.document).keydown(this._handleKeyDown).mousedown(this._handleMouseDown);
        } catch (e) {
            alert("Unable to install keyup handler on codemirror window");
        }
    }
};

CueCard.Popup.prototype._removeEventHandlers = function() {
    var self = this;
    for (var i = 0; i < this._windows.length; i++) {
        var win = this._windows[i];
        try {
            $(win.document).unbind("keydown", this._handleKeyDown).unbind("mousedown", this._handleMouseDown);
        } catch (e) {
            alert("Unable to install keyup handler on codemirror window");
        }
    }
};

CueCard.Popup.prototype._onKeyDown = function(evt) {
    if (evt.keyCode == 27) { // esc
        this.cancel();
        if ("onCancel" in this._handlers) {
            this._handlers["onCancel"]("key");
        }
    }
};

CueCard.Popup.prototype._onMouseDown = function(evt) {
    if (this.mouseEventOutsidePopup(evt)) {
        this.cancel();
        if ("onCancel" in this._handlers) {
            this._handlers["onCancel"]("mouse");
        }
    }
};

CueCard.Popup.prototype.mouseEventOutsidePopup = function(evt) {
    if (evt.currentTarget != this.elmt[0].ownerDocument) {
        return true;
    } else {
        var offset = this.elmt.offset();
        if (evt.pageX < offset.left || evt.pageX > offset.left + this.elmt.width() ||
            evt.pageY < offset.top || evt.pageY > offset.top + this.elmt.height()) {
            return true;
        }
    }
    return false;
};
/** topic-suggestors.js **/
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

CueCard.TypeBasedTopicSuggestor = function(popup, defaultSuggestions, expectedTypes, desiredProperty, onCommit) {
    this._popup = popup;
    this._defaultSuggestions = defaultSuggestions;
    this._expectedTypes = expectedTypes;
    this._desiredProperty = desiredProperty;
    this._onCommit = onCommit;
    
    this._popup.elmt.addClass("cuecard-popup-container-wide");
};

CueCard.TypeBasedTopicSuggestor.prototype.getSuggestions = function(prefix, onDone) {
    prefix = prefix.toLowerCase();
    
    if (prefix.length == 0) {
        var entries = [];
        
        for (var i = 0; i < this._defaultSuggestions.length; i++) {
            entries.push(this._defaultSuggestions[i]);
        }
        
        onDone(entries);
    } else {
        var self = this;
        var cont = CueCard.UI.createBlockingContinuations(function(cont2, o) {
            var entries = [];
            
            for (var i = 0; i < o.result.length; i++) {
                var topic = o.result[i];
                var imageURL = null;
                if ("/common/topic/image" in topic && topic["/common/topic/image"] != null && topic["/common/topic/image"].length > 0) {
                    imageURL = CueCard.freebaseServiceUrl + "api/trans/image_thumb" + topic["/common/topic/image"][0].id + "?mode=fillcrop&maxwidth=40&maxheight=40";
                }
                
                entries.push({
                    result: topic[self._desiredProperty],
                    elmt: $(
                        '<a class="cuecard-suggestion-entry" href="javascript:{}"><table cellpadding="0" cellspacing="0"><tr valign="top">' + 
                            '<td valign="top">' + 
                                (imageURL == null ? 
                                    '<div class="cuecard-suggestion-thumbnail-empty"> </div>' :
                                    ('<img src="' + imageURL + '" />')) + 
                            '</td>' +
                            '<td valign="top">' +
                                topic.name + 
                                '<div class="cuecard-suggestion-id">' + topic[self._desiredProperty] + '</div>' +
                            '</td>' +
                        '</tr></table></a>'
                    )
                });
            }
            
            onDone(entries);
        });
        this._popup.addPendingContinuation(cont);
            
        var url = CueCard.helper + "suggest-values-of-types?t=" +
                encodeURIComponent(this._expectedTypes.join(",")) + "&q=" + encodeURIComponent(prefix);
        
        CueCard.JsonpQueue.call(
            url,
            cont.onDone,
            cont.onError
        );
    }
};

CueCard.TypeBasedTopicSuggestor.prototype.commit = function(entry) {
    this._onCommit(entry);
};

/** static-choices-suggestor.js **/
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

CueCard.StaticChoicesSuggestor = function(defaultSuggestions, onCommit) {
    this._defaultSuggestions = defaultSuggestions;
    this._onCommit = onCommit;
};

CueCard.StaticChoicesSuggestor.prototype.getSuggestions = function(prefix, onDone) {
    prefix = prefix.toLowerCase();
    
    var entries = [];
    
    for (var i = 0; i < this._defaultSuggestions.length; i++) {
        var entry = this._defaultSuggestions[i];
        if (prefix.length == 0 || entry.label.toLowerCase().indexOf(prefix) >= 0) {
            entries.push(entry);
        }
    }
    
    onDone(entries);
};

CueCard.StaticChoicesSuggestor.prototype.commit = function(entry) {
    this._onCommit(entry);
};

/** property-suggestor.js **/
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

CueCard.PropertySuggestor = function(popup, defaultSuggestions, propertyEntries, onCommit) {
    this._popup = popup;
    this._defaultSuggestions = defaultSuggestions;
    this._entries = propertyEntries;
    this._onCommit = onCommit;
};

CueCard.PropertySuggestor.prototype.getSuggestions = function(prefix, onDone) {
    prefix = prefix.toLowerCase();
    
    var entries = [];
    var propertyMap = {};
    
    for (var i = 0; i < this._entries.length; i++) {
        var entry = this._entries[i];
        if (prefix.length == 0) {
            entries.push(entry);
        } else if (entry.label.toLowerCase().indexOf(prefix) >= 0) {
            entries.push(entry);
        } else {
            for (var j = 0; j < entry.expectedTypes.length; j++) {
                var expectedType = entry.expectedTypes[j];
                if (expectedType.name.toLowerCase().indexOf(prefix) >= 0) {
                    entries.push({
                        label:              entry.label,
                        hint:               entry.hint + " &rarr; type " + expectedType.id,
                        qualifiedProperty:  entry.qualifiedProperty,
                        result:             entry.result,
                        offset:             entry["offset"],
                        extent:             entry["extent"]
                    });
                    propertyMap[entry.qualifiedProperty] = true;
                    
                    break;
                }
            }
        }
    }
    
    for (var i = 0; i < this._defaultSuggestions.length; i++) {
        var entry = this._defaultSuggestions[i];
        if (prefix.length == 0 || entry.label.toLowerCase().indexOf(prefix) >= 0) {
            entries.push(entry);
        }
    }
    
    if (prefix.length < 3 && entries.length > 3) {
        onDone(entries);
    } else {
        var self = this;
        var cont = CueCard.UI.createBlockingContinuations(function(cont2, o) {
            for (var i = 0; i < o.result.length; i++) {
                var property = o.result[i];
                if (!(property.id in propertyMap) && 
                    "/type/property/schema" in property && 
                    property["/type/property/schema"] != null && 
                    property["/type/property/schema"].length > 0 &&
                    "key" in property &&
                    property.key != null &&
                    property.key.length > 0
                ) {
                    
                    var expectedTypes = "/type/property/expected_type" in property && property["/type/property/expected_type"] != null ?
                        property["/type/property/expected_type"] : [];
                        
                    var entry = {
                        label:              property.key[0],
                        hint:               "of type " + property["/type/property/schema"][0].id,
                        qualifiedProperty:  property.id,
                        expectedTypes:      expectedTypes
                    };
                    
                    var resultPrefix = '"' + property.id + '" : ';
                    CueCard.QueryEditor.setPropertySuggestionSuffix(expectedTypes.length > 0 ? expectedTypes[0] : "", entry, entry["/type/property/unique"], resultPrefix);
                    
                    entries.push(entry);
                }
            }
            onDone(entries);
        });
        this._popup.addPendingContinuation(cont);
            
        var url = CueCard.helper + "suggest-arbitrary-properties?q=" + encodeURIComponent(prefix);
        
        CueCard.JsonpQueue.call(
            url,
            cont.onDone,
            cont.onError
        );
    }
};

CueCard.PropertySuggestor.prototype.commit = function(entry) {
    this._onCommit(entry);
};

/** type-suggestor.js **/
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

CueCard.TypeSuggestor = function(defaultSuggestions) {
};

CueCard.TypeSuggestor.prototype.getSuggestions = function(prefix) {
};

/** suggestion-controller.js **/
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

CueCard.SuggestionController = function(popup, parent, suggestor, text) {
    this._popup = popup;
    this._suggestor = suggestor;
    this._lastText = text;
    this._selectedIndex = -1;
    this._suggestions = [];
    
    this._input = $('<input value="' + text + '" />');
    this._suggestionContainer = $('<div class="cuecard-suggestion-container"></div>');
    
    $(parent)
        .append($('<div class="cuecard-suggestion-input-container"></div>').append(this._input))
        .append(this._suggestionContainer);
        
    var self = this;
    this._onKeyUp = function(evt) {
        if (!evt.shiftKey && !evt.metaKey && !evt.ctrlKey) {
            if (evt.keyCode == 36 || evt.keyCode == 38 || evt.keyCode == 40) { // up down arrow movements
                return self._cancelEvent(evt);
            }
            
            var newText = self._input[0].value;
            if (newText != self._lastText) {
                self._lastText = newText;
                self._updateSuggestions();
            }
        }
    };
    this._onKeyDown = function(evt) {
        while (!evt.shiftKey && !evt.metaKey && !evt.ctrlKey) {
            if (evt.keyCode == 13 || evt.keyCode == 9) { // enter or tab
                self._commitSelectedSuggestion();
            } else if (evt.keyCode == 36) { // home
                if (self._suggestions.length > 0) {
                    self._selectSuggestion(0, true);
                }
            } else if (evt.keyCode == 38) { // arrow up
                if (self._selectedIndex > 0) {
                    self._selectSuggestion(self._selectedIndex - 1, true);
                }
            } else if (evt.keyCode == 40) { // arrow down
                if (self._selectedIndex < self._suggestions.length - 1) {
                    self._selectSuggestion(self._selectedIndex + 1, true);
                }
            } else {
                break; // skip the remaining code in the loop
            }
            return self._cancelEvent(evt);
        }
        
        if ("onKeyDown" in self._suggestor) {
            return self._suggestor.onKeyDown(evt, self._input[0].value);
        }
    };
    
    this._input.keyup(this._onKeyUp).keydown(this._onKeyDown);
    
    var input = this._input[0];
    if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(text.length, text.length);
    } else if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', text.length);
        range.moveStart('character', text.length);
        range.select();
    }
    this._input[0].focus();
    
    this._updateSuggestions();
};

CueCard.SuggestionController.prototype._updateSuggestions = function() {
    this._suggestionContainer.empty();
    this._suggestionContainer.html('<div class="cuecard-suggestion-progress">Please wait...</div>');
    this._selectedIndex = -1;
    this._suggestions.length = 0;
    
    var self = this;
    this._suggestor.getSuggestions(this._lastText, function(suggestions) {
        self._renderSuggestions(suggestions, self._lastText);
    });
};

CueCard.SuggestionController.prototype._renderSuggestions = function(suggestions, text) {
    var container = this._suggestionContainer;
    container.empty();
    
    var self = this;
    var addSuggestionEntry = function(entry, index) {
        var elmt = "elmt" in entry ? entry.elmt : 
            $('<a class="cuecard-suggestion-entry" href="javascript:{}">' + entry.label + 
                ("hint" in entry ? (' <span class="cuecard-suggestion-hint">' + entry.hint + '</span>') : '') + 
              '</a>');
            
        elmt
            .mouseover(function(evt) { self._selectSuggestion(index, false); })
            .click(function(evt) { self._commitSelectedSuggestion(); })
            .appendTo(container);
    };
    
    this._suggestions = suggestions;
    for (var i = 0; i < suggestions.length; i++) {
        addSuggestionEntry(suggestions[i], i);
    }
    
    if (this._suggestions.length > 0) {
        this._selectSuggestion(0, false);
    } else {
        $('<div class="cuecard-suggestion-noEntryMessage">No suggestion available.<br/>Press Enter to keep what you have typed,<br/>ESC to discard it.</div>').appendTo(container);
    }
    
    this._popup.reposition();
};

CueCard.SuggestionController.prototype._selectSuggestion = function(index, byKey) {
    var container = this._suggestionContainer;
    
    if (this._selectedIndex >= 0) {
        this._getSuggestion(this._selectedIndex).removeClass("cuecard-suggestion-selected");
    }
    
    this._selectedIndex = index;
    this._getSuggestion(this._selectedIndex).addClass("cuecard-suggestion-selected");
    if (byKey) {
        this._getSuggestion(this._selectedIndex)[0].scrollIntoView(false);
    }
};

CueCard.SuggestionController.prototype._commitSelectedSuggestion = function() {
    if (this._selectedIndex >= 0) {
        this._suggestor.commit(this._suggestions[this._selectedIndex]);
    } else {
        this._suggestor.commit(this._input[0].value);
    }
};

CueCard.SuggestionController.prototype._getSuggestion = function(index) {
    return $(this._suggestionContainer.children()[index]);
};

CueCard.SuggestionController.prototype._cancelEvent = function(evt) {
    evt.returnValue = false;
    evt.cancelBubble = true;
    if ("preventDefault" in evt) {
        evt.preventDefault();
    }
    return false;
}

/** query-editor.js **/
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

CueCard.QueryEditor = function(elmt, options) {
    this._container = elmt;
    this._options = options;
    this._outputPane = null;
    this._controlPane = null;
    this._warnWrites = false;
    
    this._assistKeyComboDetected = false;
    this._popup = null;
    
    var self = this;
            
    var content = "[{\n  \n}]";
    var selectLine = 1;
    var selectCol = 2;
    if ("content" in options) {
        content = options.content;
        selectLine = 0;
        selectCol = 0;
    }
    
    var codeMirrorOptions = {
        basefiles           : [],
        parserfile          : [fb.acre.libs.codemirror],     // see index.sjs
        stylesheet          : [fb.acre.libs.codemirror_css], // see index.sjs
        parserConfig:       {json: true}, 
        height:             "100%",
        autoMatchParens:    true,
        textWrapping:       false,
        highlightActiveLine : true,
        readOnly:           "readOnly" in options ? options.readOnly : false,
        content:            content,
        passDelay           : 100,     // gap between highlighting runs (each run lasts 50ms - see passTime in codemirror.js)
        undoDelay           : 250,     // min time between onChange notifications (and undo history commit)
        initCallback: function(codeMirror) {
            self._onReady();
            
            try {
                var handle = self._editor.nthLine(selectLine + 1);
                self._editor.selectLines(handle, selectCol, handle, selectCol);
            } catch (e) {}
            
            if ("onReady" in options) {
                options["onReady"]();
            }
            if (options["focusOnReady"]) {
                self.focus();
            }
        }
    };
    
    if ("onChange" in options) {
        codeMirrorOptions.onChange = options.onChange;
    }
    if (options.codeMirror) {
        $.extend(codeMirrorOptions, options.codeMirror);
    }
    
    this._overflowInput = $('<input></input>')
        .css("position", "absolute")
        .css("left", "-500px")
        .css("top", "0px")
        .appendTo(document.body);
        
    $(this._container).acre(fb.acre.apps.cuecard + "/query-editor", "query_editor", [this, codeMirrorOptions]);
};

CueCard.QueryEditor.nativeTypes = {
    '/type/int': true,
    '/type/float': true,
    '/type/boolean': true,
    '/type/rawstring': true,
    '/type/uri': true,
    '/type/datetime': true,
    '/type/bytestring': true,
    //'/type/key': true,
    '/type/value': true,
    '/type/text': true,
    '/type/enumeration':true
};

CueCard.QueryEditor.prototype.dispose = function() {
    this._cancelPopup();
    
    $(this._editor._top_element).remove();
    
    this._overflowInput.remove();
    this._controlTopContainer.remove();
    this._controlBottomContainer.remove();
    this._iframeContainer.remove();
    
    this._editor = null;
    this._overflowInput = null;
    this._controlTopContainer = null;
    this._controlBottomContainer = null;
    this._iframeContainer = null;
};

CueCard.QueryEditor.prototype._addCodemirror = function(el, options) {
    this._editor = new CodeMirror(
        function(iframe) {
            el.append(iframe);
        },
        options
    );
};

CueCard.QueryEditor.prototype.setOutputPane = function(outputPane) {
    this._outputPane = outputPane;
};

CueCard.QueryEditor.prototype.getOutputPane = function() {
    return this._outputPane;
};

CueCard.QueryEditor.prototype.setControlPane = function(controlPane) {
    this._controlPane = controlPane;
};

CueCard.QueryEditor.prototype.getControlPane = function() {
    return this._controlPane;
};

CueCard.QueryEditor.prototype.focus = function() {
    this._editor.focus();
    return this;
};

CueCard.QueryEditor.prototype.content = function(content) {
    if (content == undefined) {
        return this._editor.getCode();
    } else {
        var oldContent = this._editor.getCode();
        if (oldContent != content) {
            var editor = this._editor.editor;
            editor.history.push(
                null, 
                null, 
                this._editor.win.fixSpaces(content.replace(/\t/g, "  ").replace(/\u00a0/g, " ")).replace(/\r\n?/g, "\n").split("\n")
            );
            editor.addDirtyNode();
            editor.scheduleHighlight();
            if (editor.history.onChange) {
                editor.history.onChange();
            }
        }
        
        // We don't use this._editor.setCode() here because it resets the undo/redo history.
        return this;
    }
};

CueCard.QueryEditor.prototype.getUnresolvedQuery = function() {
    var m = this.getQueryModelAndContext();
    var q = m.model.toQueryJson();
    
    return CueCard.jsonize(q, this.getJsonizingSettings({ 
        breakLines: false, 
        omitWhitespace: true, 
        variables: this._getVariables(), 
        resolveVariables: false 
    }));
};

CueCard.QueryEditor.prototype.getResolvedQueryEnvelope = function(options) {
    return this._getResolvedQueryEnvelope(false, options);
};

CueCard.QueryEditor.prototype.getJsonizingSettings = function(o) {
    if (this._controlPane) {
        return this._controlPane.getJsonizingSettings(o);
    } else {
        o = o || {};
        if (!("indentCount" in o)) {
            o.indentCount = 2;
        }
        return o;
    }
};

CueCard.QueryEditor.prototype._getVariables = function() {
    if (this._controlPane) {
        return this._controlPane.getVariables();
    } else {
        return {};
    }
};

CueCard.QueryEditor.prototype._getQueryEnvelope = function() {
    if (this._controlPane) {
        return this._controlPane.getQueryEnvelope();
    } else {
        return {};
    }
};

CueCard.QueryEditor.prototype._getResolvedQueryEnvelope = function(cleanUp, options) {
    options = options || {};
    
    var m = this.getQueryModelAndContext();
    var q = m.model.toQueryJson();
    options.isWriteQuery = this._isWriteQuery(q);
    
    var envelope = this._getQueryEnvelope();
    var variables = this._getVariables();
    
    if (cleanUp) {
        this.content(CueCard.jsonize(q, this.getJsonizingSettings({ variables: variables, resolveVariables: false })));
        
        try {
            // Parse it again and try to put the cursor where it logically was
            var m2 = this.getQueryModelAndContext();
            var newPos = m2.model.getCursorFromContext(m.context);
            var handle = this._editor.nthLine(newPos.line + 1);
            this._editor.selectLines(handle, newPos.col);
        } catch (e) {
        }
    }
    
    envelope.query = q;
    
    return CueCard.jsonize(envelope, this.getJsonizingSettings({ breakLines: false, variables: variables, resolveVariables: true }));
};

CueCard.QueryEditor.prototype._isWriteQuery = function(q) {
    var f = function(o) {
        if (o == null) {
            return false;
        } else if (o instanceof Array) {
            if (o.length > 0 && typeof o[0] == "object") {
                for (var i = 0; i < o.length; i++) {
                    if (f(o[i])) {
                        return true;
                    }
                }
                return false;
            } else {
                return false;
            }
        } else if (typeof o == "object") {
            for (var n in o) {
                if (n == "connect" || n == "create" || f(o[n])) {
                    return true;
                }
            }
            return false;
        } else {
            return false;
        }
    };
    return f(q);
};

CueCard.QueryEditor.prototype._confirmWriteQuery = function(options) {
    return (options.isWriteQuery && !this._warnWrites && CueCard.apiProxy.base.indexOf("sandbox") < 0);
};

CueCard.QueryEditor.prototype.getMqlReadURL = function() {
    var options = {};
    var q = this.getResolvedQueryEnvelope(options);
    
    var serviceUrl = CueCard.freebaseServiceUrl + 'api/service/' + (options.isWriteQuery ? 'mqlwrite' : 'mqlread');
    if ("service" in this._options && this._options.service != null) {
        serviceUrl = this._options.service;
    }
    
    return serviceUrl + '?query=' + encodeURIComponent(q);
};

CueCard.QueryEditor.prototype.run = function(forceCleanUp) {
    if (this._outputPane != null) {
        var options = {};
        var q = this._getResolvedQueryEnvelope(forceCleanUp || (this._controlPane && this._controlPane.getSetting("cleanup")), options);
        
        if (this._confirmWriteQuery(options)) {
            if (window.confirm("Your query will write data into Freebase.\nAre you sure you want to do that?")) {
                this._warnWrites = true;
            } else {
                return;
            }
        }
        
        /*
         *  A small hack to let Andi debug uMql, and for Warren to debug his new mql.
         */
        var url = CueCard.apiProxy.base + CueCard.apiProxy[options.isWriteQuery ? 'write' : 'read'] +
            ("emql" in this._options && this._options.emql ? "emql=1&" : "") +
            ("debug" in this._options ? ("debug=" + this._options.debug + "&") : "") +
            ("service" in this._options && this._options.service != null ? ("service=" + encodeURIComponent(this._options.service) + "&") : "");
        
        var self = this;
        var onDone = function(o) {
            if (o["error"] == "unauthorized") {
                self._outputPane.setStatus("Query editor is not authorized to write on your behalf.");
                self._options.onUnauthorizedMqlWrite();
            } else {
                self._outputPane.renderResponseHeaders(o.headers);
              
                var options = {};
                if (self._controlPane != null && self._controlPane.getSetting("multilineErrorMessages") && 
                    "code" in o.body && o.body.code == "/api/status/error" && "messages" in o.body && o.body.messages != null) {
                    options["encodeJavascriptString"] = function(x) { return x; };
                }
                self._outputPane.setJSONContent(o.body, self.getJsonizingSettings(options));
            }
        };
        var onError = function(msg) {
            alert(msg);
        }
        
        this._outputPane.setStatus("Querying...");
        if (options.isWriteQuery || q.length > 1024) {
            $.post(url, { "query" : q }, onDone, "json");
        } else {
            CueCard.JsonpQueue.call(url + "query=" + encodeURIComponent(q), onDone, onError);
        }
    }
    if ("onRun" in this._options) {
        this._options["onRun"]();
    }
};

CueCard.QueryEditor.prototype.getQueryModelAndContext = function() {
    var pos = this._editor.cursorPosition(false);
    var lineNo = this._editor.lineNumber(pos.line) - 1;
    var colNo = pos.character;
    
    return CueCard.QueryParser.parseForContext(this._editor.getCode(), 0, lineNo, colNo);
};

CueCard.QueryEditor.prototype._onReady = function() {
    var self = this;
    try {
        $(this._editor.win.document).keyup(function(evt) {
            return self._onEditorKeyUp(evt);
        }).keydown(function(evt) {
            return self._onEditorKeyDown(evt);
        }).mousedown(function(evt) {
            return self._onEditorMouseDown(evt);
        });
    } catch (e) {
        alert("Unable to install keyup handler on codemirror window");
    }
    
    if ("cleanUp" in this._options && this._options.cleanUp) {
        this._editor.getCode();     // XXX fulhack... seem to run into timing issues on startup without this
        this._onCleanUp();
    }
};

CueCard.QueryEditor.prototype._onRun = function(forceCleanUp) {
    this.run(forceCleanUp);
};

CueCard.QueryEditor.prototype._onCleanUp = function() {
    var m = this.getQueryModelAndContext();
    var q = m.model.toQueryJson();
    var variables = this._getVariables();
    this.content(CueCard.jsonize(q, this.getJsonizingSettings({ variables: variables, resolveVariables: false })));
};

CueCard.QueryEditor.prototype._onEditorMouseDown = function(evt) {
    
};

CueCard.QueryEditor.prototype._onEditorKeyDown = function(evt) {
    if (evt.keyCode == 9 || // tab
        (evt.keyCode == 32 && (evt.ctrlKey || evt.metaKey || evt.altKey)) // space with modifier
        ) {
        this._assistKeyComboDetected = true;
        evt.preventDefault();
        return false;
    } else {
        this._assistKeyComboDetected = false;
        
        if ((evt.metaKey || evt.ctrlKey) && evt.keyCode == 13) { // meta or ctrl-enter
            this._onRun(evt.shiftKey);
        }
    }
};

CueCard.QueryEditor.prototype._onEditorKeyUp = function(evt) {
    if (this._assistKeyComboDetected) {
        this._assistKeyComboDetected = false;
        this.startAssistAtCursor();
        
        evt.preventDefault();
        return false;
    }
};

CueCard.QueryEditor.prototype.startAssistAtCursor = function() {
    var p = this._editor.cursorPosition(false);
    var l = this._editor.lineNumber(p.line) - 1;
    var col = p.character;
    var s = this._editor.lineContent(p.line);
    
    var veryFirstContentNode = this._editor.win.document.body.firstChild;
    var previousNode = p.line || veryFirstContentNode;
    var node = previousNode.nextSibling;
    var c = col;
    while (c > 0 && 
        node != null && 
        node.tagName.toLowerCase() != "br" && 
        node.firstChild != null && 
        node.firstChild.nodeValue.length >= c
    ) {
        c -= node.firstChild.nodeValue.length;
        
        previousNode = node;
        node = node.nextSibling;
    }
    
    if (node == null || node.tagName.toLowerCase() == "br") {
        // Case: end of content or end of line
        if (node != null) {
            var offset = $(node).offset();
            if ($.browser.msie && previousNode != null && previousNode.tagName.toLowerCase() != "br") {
                var left = previousNode.offsetWidth;
                var height = previousNode.offsetHeight;
            } else {
                var left = offset.left;
                var height = node.offsetHeight;
            }
        } else {
            var offset = $(previousNode).offset();
            var charCount = previousNode.firstChild ? previousNode.firstChild.nodeValue.length : 0;
            var left = offset.left + (charCount == 0 ? 0 : (c * previousNode.offsetWidth / charCount));
            var height = previousNode.offsetHeight;
        }
        this._startAssist(l, col, {
            left:   left,
            top:    offset.top,
            height: height
        });
    } else {
        var offset = $(node).offset();
        var charCount = node.firstChild ? node.firstChild.nodeValue.length : 0;
        this._startAssist(l, col, {
            left:   offset.left + (charCount == 0 ? 0 : (c * node.offsetWidth / charCount)), 
            top:    offset.top,
            height: node.offsetHeight
        });
    }
};

CueCard.QueryEditor.prototype._startAssist = function(lineNo, columnNo, positioning) {
    this._cancelPopup();
    
    if (positioning != null) {
        var offset = $(this._iframeContainer).offset();
        offset.left -= this._editor.win.document.body.scrollLeft + document.body.scrollLeft;
        offset.top -= this._editor.win.document.body.scrollTop + document.body.scrollTop;
        
        var self = this;
        this._popup = new CueCard.Popup(
            Math.round(offset.left + positioning.left),
            Math.round(offset.top + positioning.top),
            Math.round(positioning.height),
            [ window, this._editor.win ],
            {
                onCancel: function(mode) {
                    if (mode == "key") {
                        self.focus();
                    }
                }
            }
        );
        this._popup.elmt.html('<div class="cuecard-popup-message">Please wait...</div>');
        
        var mc = this.getQueryModelAndContext();
        if (mc.context.length > 0) {
            var contextNode = mc.context[mc.context.length - 1];
            if ("relative" in contextNode) {
                if (contextNode.node.type == CueCard.QueryNode.TYPE_NONTERMINAL) {
                    if (contextNode.relative == "path" || 
                        contextNode.relative == "before") {
                        
                        this._startSuggestProperties(lineNo, columnNo, mc, contextNode);
                        return;
                        
                    } else if (contextNode.relative == "space") {
                        /*
                         *  The cursor is where a value node should be. We need the
                         *  corresponding link to know what to suggest.
                         */
                        var link = contextNode.node.links[contextNode.child];
                        
                        this._startSuggestValues(lineNo, columnNo, mc, contextNode, link);
                        return;
                    }
                } else if (contextNode.node.type == CueCard.QueryNode.TYPE_TERMINAL) {
                    /*
                     *  Go up the context chain to find the link, which gives us hints
                     *  at what the values can be (topic types, number, boolean, etc.).
                     */
                    var link = null;
                    if (mc.context.length > 1) {
                        var outerContextNode = mc.context[mc.context.length - 2];
                        link = outerContextNode.node.links[outerContextNode.child];
                    }
                    this._startSuggestValues(lineNo, columnNo, mc, contextNode, link);
                    return;
                }
            } else {
                // This is the case of the bare token.
                
                /*
                 *  Go up the context chain to find the link, which gives us hints
                 *  at what the values can be (topic types, number, boolean, etc.).
                 */
                var link = null;
                if (mc.context.length > 1) {
                    var outerContextNode = mc.context[mc.context.length - 2];
                    if (outerContextNode.node.type == CueCard.QueryNode.TYPE_NONTERMINAL) {
                        link = outerContextNode.node.links[outerContextNode.child];
                    } else if (mc.context.length > 2) {
                        outerContextNode = mc.context[mc.context.length - 3];
                        link = outerContextNode.node.links[outerContextNode.child];
                    }
                }
                
                this._startSuggestValues(lineNo, columnNo, mc, contextNode, link);
                return;
            }
        }
    }
    this._popup.elmt.html(
        '<div class="cuecard-popup-message">' + 
            'Sorry, we don\'t know how to assist you here. ' + 
            'Send us a link to this exact query using the links at the upper right corner and we will investigate. ' +
            'Thank you!' +
        '</div>'
    );
    //console.log(mc);
};

CueCard.QueryEditor.prototype._cancelPopup = function() {
    if (this._popup != null) {
        this._popup.cancel();
        this._popup = null;
    }
};

CueCard.QueryEditor.prototype._startSuggestProperties = function(lineNo, columnNo, mc, contextNode) {
    var self = this;
    
    var token = (contextNode.relative == "path") ? contextNode.node.links[contextNode.child].token : null;
    
    this._startBufferInput();
    this._prepareQueryForSuggestions(mc, lineNo, columnNo, token, function(cont, prefix, placeResult, globalPropertyMap) {
        var onLocatedInnerMostNonTerminal = function(cont2, result) {
            var types = [];
            var ids = [];
            var guids = [];
            
            result.node.getDeclaredTypes(types);
            result.node.getDeclaredIDs(ids);
            result.node.getDeclaredGUIDs(guids);
            
            var params = [];
            if (types.length > 0) {
                params.push("t=" + encodeURIComponent(types.join(",")));
            }
            if (ids.length > 0) {
                params.push("i=" + encodeURIComponent(ids.join(",")));
            }
            if (guids.length > 0) {
                params.push("g=" + encodeURIComponent(guids.join(",")));
            }
            if (result.property != null) {
                params.push("p=" + encodeURIComponent(result.property));
                params.push("r=" + result.reverse);
            }
            
            var url = CueCard.helper + "suggest-properties?" + params.join("&");
            CueCard.JsonpQueue.call(
                url,
                cont2.extend(onGotSuggestedProperties).onDone,
                cont.onError
            );
            
            return true; // don't clean up
        };
        var onGotSuggestedProperties = function(cont2, o) {
            self._suggestProperties(mc, o, prefix + self._stopBufferInput(), placeResult);
        };
        
        mc.model.locateInnerMostNonTerminal(
            mc.context, 
            cont.extend(onLocatedInnerMostNonTerminal)
        );
        return true;
    });
};

CueCard.QueryEditor.prototype._startBufferInput = function() {
    this._overflowInput[0].value = "";
    this._overflowInput[0].focus();
};

CueCard.QueryEditor.prototype._stopBufferInput = function() {
    return this._overflowInput[0].value;
};

CueCard.QueryEditor.prototype._suggestProperties = function(mc, suggestion, prefix, placeResult) {
    this._popup.elmt.empty();
    this._popup.elmt.html("<div></div>");
    
    var entries = [];
    for (var n in suggestion.properties) {
        var entry = suggestion.properties[n];
        var slash = n.lastIndexOf("/");
        var shortName = n.substr(slash + 1);
        var type = n.substr(0, slash);
        var explicit = entry.explicit;
        
        if ("parentProperty" in entry) {
            var resultPrefix = '"' + entry.parentProperty + '" : [{ "' + shortName + '" : ';
            var resultInfix = (entry.unique ? 'null' : '[]');
            var resultSuffix = ' }]';
            
            entries.push({
                label: shortName,
                hint: "of type " + type + " (through " + entry.parentProperty + ")",
                qualifiedProperty: n,
                result: resultPrefix + resultInfix + resultSuffix,
                offset: resultPrefix.length,
                extent: resultInfix.length,
                expectedTypes: entry.expectedTypes
            });
        } else {
            var resultPrefix = '"' + (explicit ? shortName : n) + '" : ';
            var expectedType = entry.expectedTypes.length > 0 ? entry.expectedTypes[0].id : "";
            var entry2 = {
                label: shortName,
                hint: "of type " + type,
                qualifiedProperty: n,
                expectedTypes: entry.expectedTypes
            };
            
            CueCard.QueryEditor.setPropertySuggestionSuffix(expectedType, entry2, entry.unique, resultPrefix);
            entries.push(entry2);
        }
    }
    
    var self = this;
    var suggestor = new CueCard.PropertySuggestor(
        this._popup,
        CueCard.MqlSyntax.KeywordSuggestions, 
        entries, 
        placeResult
    );
    var controller = new CueCard.SuggestionController(this._popup, this._popup.elmt[0].firstChild, suggestor, prefix);
};

CueCard.QueryEditor.setPropertySuggestionSuffix = function(expectedType, entry, unique, resultPrefix) {
    var resultSuffix = null;
    if (expectedType == "/common/image" || expectedType == "/common/document") {
        resultSuffix = '{ "id" : null, "optional" : true, "limit" : 3 }';
        if (!unique) {
            resultSuffix = "[" + resultSuffix + "]";
        }
    } else if (expectedType == "/measurement_unit/dated_integer") {
        resultSuffix = '{ "number" : null, "date" : null }';
        if (unique) {
            resultSuffix = "[" + resultSuffix + "]";
        }
    } else if (expectedType == "/measurement_unit/dated_money_value") {
        resultSuffix = '{ "amount" : null, "valid_date" : null, "currency" : null }';
        if (unique) {
            resultSuffix = "[" + resultSuffix + "]";
        }
    } else if (expectedType.indexOf("/type/") == 0) {
        resultSuffix = (unique ? 'null' : '[]');
    } else {
        resultSuffix = (unique ? '{}' : '[{}]');
    }
    entry.result = resultPrefix + resultSuffix;
    entry.offset = resultPrefix.length;
    entry.extent = resultSuffix.length;
};

CueCard.QueryEditor.prototype._startSuggestValues = function(lineNo, columnNo, mc, contextNode, link) {
    var self = this;
    
    var token = ("token" in contextNode) ? contextNode.token : null;
    
    this._startBufferInput();
    this._prepareQueryForSuggestions(mc, lineNo, columnNo, token, function(cont, prefix, placeResult, globalPropertyMap) {
        prefix += self._stopBufferInput();
        
        if (link != null && !link.reverse && CueCard.QueryNode.isMqlKeyword(link.path)) {
            self._suggestValuesForKeyword(lineNo, columnNo, mc, contextNode, link.path, prefix, placeResult);
        } else {
            function preparePopup() {
                self._popup.elmt.empty();
                self._popup.elmt.html('<div></div><div class="cuecard-suggestion-hint-message">Keep typing to search for topics of types fitting this point in the query.</div>');
            };
            
            var property = link.qualifiedProperty;
            var reverse = link.reverse;
            
            if (!reverse && (property == "/type/object/id" || property == "/type/object/guid" || property == "/type/object/name")) {
                /*
                 *  We need to know the possible types in order to suggest id and guid intelligently.
                 */
                var onLocatedInnerMostNonTerminal = function(cont2, result) {
                    preparePopup();
                    
                    var expectedTypes = [];
                    result.node.getDeclaredTypes(expectedTypes);
                    
                    if ("property" in result && result.property != null) {
                        var leadinProperty = result.property;
                        var leadinReverse = result.reverse;
                        
                        if (reverse) {
                            expectedTypes.push(leadinProperty.substr(0, leadinProperty.lastIndexOf("/")));
                        } else if (leadinProperty in globalPropertyMap) {
                            var expectedTypes2 = globalPropertyMap[leadinProperty].expectedTypes;
                            for (var t = 0; t < expectedTypes2.length; t++) {
                                expectedTypes.push(expectedTypes2[t].id);
                            }
                        }
                    }
                    
                    var suggestor = new CueCard.TypeBasedTopicSuggestor(
                        self._popup,
                        CueCard.MqlSyntax.SingleValueSuggestions, 
                        expectedTypes,
                        link.property,
                        placeResult
                    );
                    var controller = new CueCard.SuggestionController(self._popup, self._popup.elmt[0].firstChild, suggestor, prefix);
                };
                mc.model.locateInnerMostNonTerminal(
                    mc.context, 
                    cont.extend(onLocatedInnerMostNonTerminal)
                );
                return true;
            } else {
                preparePopup();
                
                var expectedTypes;
                var unique = false;
                
                if (reverse) {
                    expectedTypes = [ property.substr(0, property.lastIndexOf("/")) ];
                } else if (property == "/type/object/type") {
                    expectedTypes = [ "/type/type" ];
                } else if (property in globalPropertyMap) {
                    unique = globalPropertyMap[property].unique;
                    
                    expectedTypes = [];
                    var expectedTypes2 = globalPropertyMap[property].expectedTypes;
                    for (var t = 0; t < expectedTypes2.length; t++) {
                        expectedTypes.push(expectedTypes2[t].id);
                    }
                } else if (property == "/type/text/lang") {
                    expectedTypes = [ "/type/lang" ];
                } else {
                    expectedTypes = [];
                }
                
                var singleExpectedType = (expectedTypes.length == 1) ? expectedTypes[0] : null;
                
                if (singleExpectedType !== null && singleExpectedType in CueCard.QueryEditor.nativeTypes) {
                    var suggestor = new CueCard.StaticChoicesSuggestor(
                        CueCard.MqlSyntax[
                            singleExpectedType == "/type/text" ?
                                (unique ? "UniqueStringLiteralValueSuggestions" : "StringLiteralValueSuggestions") :
                                (unique ? "UniqueLiteralValueSuggestions" : "LiteralValueSuggestions")
                        ], 
                        placeResult
                    );
                } else {
                    var suggestor = new CueCard.TypeBasedTopicSuggestor(
                        self._popup,
                        CueCard.MqlSyntax[ unique ? "UniqueTopicValueSuggestions" : "TopicValueSuggestions" ], 
                        expectedTypes,
                        "id",
                        placeResult
                    );
                }
                var controller = new CueCard.SuggestionController(self._popup, self._popup.elmt[0].firstChild, suggestor, prefix);
            }
        }
    });
};

CueCard.QueryEditor.prototype._suggestValuesForKeyword = function(lineNo, columnNo, mc, contextNode, keyword, prefix, placeResult) {
    this._popup.elmt.empty();

    var hint = CueCard.MqlSyntax.KeywordValueHints[keyword];
    if ("html" in hint) {
        this._popup.elmt.html('<div class="cuecard-suggestion-hint-message">' + hint.html + '</div>');
        this.focus();
    } else {
        this._popup.elmt.html("<div></div>");
    
        var self = this;
        var suggestor = new CueCard.StaticChoicesSuggestor(
            hint.choices, 
            placeResult
        );
        var controller = new CueCard.SuggestionController(this._popup, this._popup.elmt[0].firstChild, suggestor, prefix);
    }
};

CueCard.QueryEditor.prototype._prepareQueryForSuggestions = function(mc, lineNo, columnNo, token, f) {
    var self = this;
    var prefix = "";
    var replaceToken;
    
    var insertAndSelect = function(l, c, o, offset, extent) {
        var text = (offset === undefined || typeof o !== "string") ? CueCard.jsonize(o, { breakLines: false }) : o;
        var start = c + (typeof offset == "number" ? offset : text.length);
        var end = start + (typeof extent == "number" ? extent : 0);
        
        self._editor.editor.replaceSelection(text); 
        // for IE, we need to call the codemirror's internal editor field's method.
        // otherwise, codemirror's own replaceSelection method will call focus(), which messes up the selection in IE.
        
        var line = self._editor.nthLine(l + 1);
        self._editor.selectLines(line, start, line, end);
    };
    if (token != null) {
        var startContentIndex = 0;
        var startCol = token.start.col;
        if (/^['"]/.test(token.content)) {
            startContentIndex = 1;
        }
        prefix = token.content.substring(startContentIndex, columnNo - startCol).replace(/['"]$/, '');
        
        replaceToken = function(o, offset, extent) {
            var line = self._editor.nthLine(token.start.line + 1);
            
            self._editor.selectLines(line, token.start.col, line, token.end.col);
            insertAndSelect(token.start.line, token.start.col, o, offset, extent);
        };
    } else {
        var pos = this._editor.cursorPosition(true);
        var l = this._editor.lineNumber(pos.line) - 1;
        var c = pos.character;
        
        replaceToken = function(o, offset, extent) {
            var line = self._editor.nthLine(l + 1);
            
            self._editor.selectLines(line, c, line, c);
            insertAndSelect(l, c, o, offset, extent);
        };
    }
    
    var placeResult = function(entry) {
        self._popup.close();
        if (typeof entry == "string") {
            replaceToken(entry);
        } else {
            replaceToken(entry.result, entry["offset"], entry["extent"]);
        }
    };
    
    var continuation = CueCard.UI.createBlockingContinuations(function(cont, globalPropertyMap) {
        return f(cont, prefix, placeResult, globalPropertyMap || {});
    });
    this._popup.addPendingContinuation(continuation);
    
    mc.model.qualifyAllProperties(continuation);
};

CueCard.QueryEditor.prototype._showExamples = function(evt) {
    var self = this;
    
    CueCard.showDialog("examples", { 
        onDone: function(q) { 
            self.content(q); 
            self._onRun(false);
        } 
    });
};

/** output-pane.js **/
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

CueCard.OutputPane = function(elmt, options) {
    this._elmt = $(elmt);
    this._options = options || {};
    
    this._jsonResult = null;
    this._lastJsonOutputMode = $.cookie("cc_op_mode") == "text" ? "text" : "tree";
    this._treeConstructed = false;
    
    this._constructUI();
};

CueCard.OutputPane.prototype.dispose = function() {
    // TODO
};

CueCard.OutputPane.prototype._constructUI = function() {
    var self = this;
    var idPrefix = this._idPrefix = "t" + Math.floor(1000000 * Math.random());
    
    this._elmt.acre(fb.acre.apps.cuecard + "/output-pane", "tabs", [idPrefix, this]);
    
    var tabs = $('#' + idPrefix + " > .section-tabset");
    tabs.tabs('#' + idPrefix + " > .tabbed-content > .cuecard-outputPane-tabBody", {
      "initialIndex": (this._lastJsonOutputMode == "tree") ? 0 : 1,
      "onBeforeClick": function(event, index) {
        window.__cc_tree_disposePopup();
        if (index == 0) { // tree
            self._lastJsonOutputMode = "tree";
            if (self._jsonResult != null && !self._treeConstructed) {
                self._constructTree();
            }
        } else if (index == 1) {
            self._lastJsonOutputMode = "text";
        }
        
        $.cookie("cc_op_mode", self._lastJsonOutputMode, { expires: 365 });
      }
    });
    this._tabs = tabs.data("tabs");
    
    this._tree = this._getTab("tree").find("div");
    this._textarea = this._getTab("text").find("textarea");
    this._status = this._getTab("status").find("div");
};

CueCard.OutputPane.prototype._getTab = function(name) {
    return $("#" + this._idPrefix + "-" + name);
};

CueCard.OutputPane.prototype.setJSONContent = function(o, jsonizingSettings) {
    this._jsonResult = o;
    this._textarea[0].value = CueCard.jsonize(o, jsonizingSettings || { indentCount: 2 });
    
    var tabToSelect;
    if (this._lastJsonOutputMode == "tree") {
        this._constructTree();
        tabToSelect = 0;
    } else {
        this._tree.empty();
        this._treeConstructed = false;
        tabToSelect = 1;
    }
    
    var self = this;
    var selectTab = function() {
        self._tabs.click(tabToSelect);
    };
    
    // tabs have to be selected asynchronously or Chrome will crash.
    window.setTimeout(selectTab, 100);
};

CueCard.OutputPane.prototype.setStatus = function(html) {
    this._tabs.click(2);
    this._status.html(html);
    
    this._jsonResult = null;
    this._textarea.val("");
    this._tree.empty();
    this._treeConstructed = false;
};

CueCard.OutputPane.prototype.getJson = function() {
    return this._jsonResult;
};

CueCard.OutputPane.prototype.renderResponseHeaders = function(headers) {
    this.setStatus($.acre(fb.acre.apps.cuecard + "/output-pane", "status", [headers]));
};

CueCard.OutputPane.prototype._constructTree = function() {
    var self = this;
    
    /*
     *  WARNING: Unless you know what you're doing, the code in this function
     *  is very fragile. Do not change it.
     */
    
    this._treeConstructed = true;
    
    var html = [];
    var makeImage = function(url, visible) {
        return '<img class="cuecard-outputPane-tree-toggle" onclick="__cc_tree_toggle(this);" src="' + CueCard.urlPrefix + url + '" ' + (visible ? '' : ' style="display: none;"') +'/>';
    };
    var append = function(s) {
        html.push(s);
    };
    var makeExploreLink = function(id) {
        return "<a class='cuecard-outputPane-tree-explore' target='_blank' href='" + CueCard.freebaseServiceUrl + "tools/explore" + id + "'>xp</a>";
    };
    var makeTopicLink = function(id, label) {
        append(
            "<a target='_blank' class='cuecard-outputPane-tree-dataLink' href='" + CueCard.freebaseServiceUrl + "view" + id +
                "' onmouseover='__cc_tree_mouseOverTopic(this)' onmouseout='__cc_tree_mouseOutTopic(this)' fbid='" + id + "'>" + 
                label + 
            "</a>" + 
            makeExploreLink(id));
    };
    var makeImageLink = function(id, label) {
        append(
            "<a target='_blank' class='cuecard-outputPane-tree-dataLink' href='" + CueCard.freebaseServiceUrl + "view" + id +
                "' onmouseover='__cc_tree_mouseOverImage(this)' onmouseout='__cc_tree_mouseOutImage(this)' fbid='" + id + "'>" + 
                label + 
            "</a>" + 
            makeExploreLink(id));
    };
    var makeRawImageLink = function(url) {
        append(
            "<a target='_blank' class='cuecard-outputPane-tree-dataLink' href='" + url +
                "' onmouseover='__cc_tree_mouseOverImage(this)' onmouseout='__cc_tree_mouseOutImage(this)'>" + 
                JSON.stringify(url) + 
            "</a>");
    };
    var makeBlurbLink = function(id, label) {
        append(
            "<a target='_blank' class='cuecard-outputPane-tree-dataLink' href='" + CueCard.freebaseServiceUrl + "view" + id +
                "' onmouseover='__cc_tree_mouseOverArticle(this)' onmouseout='__cc_tree_mouseOutArticle(this)' fbid='" + id + "'>" + 
                label + 
            "</a>" + 
            makeExploreLink(id));
    };
    var makeSpecialLink = function(superFieldName, id, label) {
        if (superFieldName == "image" || superFieldName == "/common/topic/image") {
            makeImageLink(id, label);
        } else if (superFieldName == "article" || superFieldName == "/common/topic/article") {
            makeBlurbLink(id, label);
        } else {
            makeTopicLink(id, label);
        }
    };
    var startsWith = function(big, small) {
        return big.length > small.length && big.substr(0, small.length) == small;
    };
    var constructNode = function(o, appenders, path) {
        if (o == null) {
            appenders.startBody(false);
            append("<span>" + JSON.stringify(o) + "</span>");
            appenders.endBody(false);
        } else if (typeof o != "object") {
            appenders.startBody(false);
            
            var fieldName = path[0];
            var superFieldName = path.length > 1 ? path[1] : "";
            if (fieldName == "id" || fieldName == "/type/object/id") {
                makeSpecialLink(superFieldName, o, JSON.stringify(o));
            } else if (fieldName == "guid" || fieldName == "/type/object/guid") {
                makeSpecialLink(superFieldName, "/guid/" + o.substr(1), JSON.stringify(o));
            } else if (fieldName == "type" || fieldName == "/type/object/type") {
                append("<a target='_blank' href='" + CueCard.freebaseServiceUrl + "type/schema" + o + "'>" + JSON.stringify(o) + "</a>" + makeExploreLink(o));
            } else if (typeof o == "string" && (startsWith(o, "http://") || startsWith(o, "https://") || startsWith(o, "ftp://"))) {
                if (startsWith(o, "http://chart.apis.google.com/chart?")) {
                    makeRawImageLink(o);
                } else {
                    append("<a target='_blank' href='" + o + "'>" + JSON.stringify(o) + "</a>");
                }
            } else {
                append("<span>" + JSON.stringify(o) + "</span>");
            }
            appenders.endBody(false);
        } else if (o instanceof Array) {
            if (o.length == 0) {
                appenders.startBody(false);
                append("<span>[]</span>");
                appenders.endBody(false);
            } else {
                var style = (o.length > 1 && typeof o[0] == 'object') ? '' : ' style="display: none;"';
                
                appenders.startBody(true, 
                    '<span cc:mode="normal">[ ' +
                        '<a href="javascript:{}" class="cuecard-outputPane-tree-all" onclick="__cc_tree_expandAll(this);"' + style + '>expand all</a><span class="cuecard-outputPane-tree-toggles"' + style + '> &bull; </span>' +
                        '<a href="javascript:{}" class="cuecard-outputPane-tree-all" onclick="__cc_tree_collapseAll(this);"' + style + '>collapse all</a><span class="cuecard-outputPane-tree-toggles"' + style + '> &bull; </span>' +
                        '<a href="javascript:{}" class="cuecard-outputPane-tree-all" onclick="__cc_tree_flip(this);"' + style + '>1-by-1</a>' +
                    '</span>', 
                    '<span style="display: none;">[ ' + (o.length > 1 ? (o.length + ' elements') : '1 element') + ' ]</span>');
                append('<div class="cuecard-outputPane-tree-arrayBody cuecard-outputPane-tree-normalMode">');
                
                var makeAppenders = function(index, canGoBack, canGoForward) {
                    return {
                        startBody: function(collapsible, expandedHeader, collapsedHeader) {
                            if (collapsible) {
                                append('<div class="cuecard-outputPane-tree-arrayElement">' +
                                    makeImage('expanded.png', true) + makeImage('collapsed.png', false) +
                                    '<span class="cuecard-outputPane-tree-memberName">' + index + ':</span> ' +
                                    expandedHeader + 
                                    collapsedHeader +
                                    '<span>' +
                                        (canGoBack ? '<a href="javascript:{}" class="cuecard-outputPane-tree-flipControl" onclick="__cc_tree_flipPrevious(this);">previous</a> ' : '') +
                                        (canGoForward ? '<a href="javascript:{}" class="cuecard-outputPane-tree-flipControl" onclick="__cc_tree_flipNext(this);">next</a>' : '') +
                                    '</span>'
                                );
                            } else {
                                append('<div class="cuecard-outputPane-tree-arrayElement"><span class="cuecard-outputPane-tree-memberName">' + index + ':</span> ');
                            }
                        },
                        endBody: function(collapsible) {
                            append('</div>');
                        }
                    };
                };
                
                for (var i = 0; i < o.length; i++) {
                    constructNode(o[i], makeAppenders(i, i > 0, i < o.length - 1), path);
                }
                
                append('</div>');
                appenders.endBody(true);
            }
        } else {
            appenders.startBody(true, 
                '<span>{</span>', 
                '<span style="display: none;">{...}</span>');
            append('<div class="cuecard-outputPane-tree-objectBody cuecard-outputPane-tree-normalMode">');
            
            var makeAppenders = function(fieldName) {
                return {
                    startBody: function(collapsible, expandedHeader, collapsedHeader) {
                        if (collapsible) {
                            append('<div class="cuecard-outputPane-tree-objectField">' +
                                makeImage('expanded.png', true) + makeImage('collapsed.png', false) +
                                '<span class="cuecard-outputPane-tree-memberName">' + fieldName + ':</span> ' +
                                expandedHeader + 
                                collapsedHeader + 
                                '<span></span>'
                            );
                        } else {
                            append('<div class="cuecard-outputPane-tree-objectField"><span class="cuecard-outputPane-tree-memberName">' + fieldName + ':</span> ');
                        }
                    },
                    endBody: function(collapsible) {
                        append('</div>');
                    }
                };
            };
            
            for (var n in o) {
                constructNode(o[n], makeAppenders(n), [ n ].concat(path));
            }
            
            append('</div>');
            appenders.endBody(true);
        }
    };
    
    constructNode(this._jsonResult, {
        startBody: function(collapsible) {},
        endBody: function() {}
    }, [ "__root__" ]);
    this._tree.html(html.join(""));
};

window.__cc_tree_toggle = function(img) {
    var expanded = img.src.indexOf("expanded.png") > 0;
    var parent = img.parentNode;
    if (expanded) {
        window.__cc_tree_collapse(parent);
    } else {
        window.__cc_tree_expand(parent);
    }
};

window.__cc_tree_expand = function(elmt) {
    if (elmt.firstChild.tagName.toLowerCase() == "img") {
        var body = elmt.lastChild;
        body.style.display = "block";
        
        elmt.childNodes[0].style.display = "inline";
        elmt.childNodes[1].style.display = "none";
        
        var collapsedHeader = body.previousSibling.previousSibling;
        var expandedHeader = collapsedHeader.previousSibling;
        expandedHeader.style.display = "inline";
        collapsedHeader.style.display = "none";
    }
};

window.__cc_tree_collapse = function(elmt) {
    if (elmt.firstChild.tagName.toLowerCase() == "img") {
        var body = elmt.lastChild;
        body.style.display = "none";
        
        elmt.childNodes[0].style.display = "none";
        elmt.childNodes[1].style.display = "inline";
        
        var collapsedHeader = body.previousSibling.previousSibling;
        var expandedHeader = collapsedHeader.previousSibling;
        expandedHeader.style.display = "none";
        collapsedHeader.style.display = "inline";
    }
};

(function() {
    var restoreNormalMode = function(link) {
        var mode = link.parentNode.getAttribute("cc:mode");
        var body = link.parentNode.nextSibling.nextSibling.nextSibling;
        if (mode == "flip") {
            for (var i = 0; i < body.childNodes.length; i++) {
                body.childNodes[i].style.display = "block";
            }
            link.parentNode.setAttribute("cc:mode", "normal");
            $(link.parentNode.parentNode).find("> div.cuecard-outputPane-tree-arrayBody")
                .addClass("cuecard-outputPane-tree-normalMode")
                .removeClass("cuecard-outputPane-tree-flipMode");
        }
    };
    
    window.__cc_tree_expandAll = function(link) {
        restoreNormalMode(link);
        var body = link.parentNode.nextSibling.nextSibling.nextSibling;
        for (var i = 0; i < body.childNodes.length; i++) {
            __cc_tree_expand(body.childNodes[i]);
        }
    };

    window.__cc_tree_collapseAll = function(link) {
        restoreNormalMode(link);
        var body = link.parentNode.nextSibling.nextSibling.nextSibling;
        for (var i = 0; i < body.childNodes.length; i++) {
            __cc_tree_collapse(body.childNodes[i]);
        }
    };
    
    window.__cc_tree_flip = function(link) {
        var mode = link.parentNode.getAttribute("cc:mode");
        var body = link.parentNode.nextSibling.nextSibling.nextSibling;
        if (mode == "normal") {
            for (var i = 0; i < body.childNodes.length; i++) {
                var child = body.childNodes[i];
                child.style.display = i == 0 ? "block" : "none";
                __cc_tree_expand(child);
            }
            link.parentNode.setAttribute("cc:mode", "flip");
            $(link.parentNode.parentNode).find("> div.cuecard-outputPane-tree-arrayBody")
                .removeClass("cuecard-outputPane-tree-normalMode")
                .addClass("cuecard-outputPane-tree-flipMode");
        }
    };
    
    window.__cc_tree_flipPrevious = function(link) {
        var parent = link.parentNode.parentNode;
        parent.style.display = "none";
        parent.previousSibling.style.display = "block";
    };
    
    window.__cc_tree_flipNext = function(link) {
        var parent = link.parentNode.parentNode;
        parent.style.display = "none";
        parent.nextSibling.style.display = "block";
    };
    
    window.__cc_tree_mouseOverTopic = function(elmt) {
        var id = elmt.getAttribute("fbid");
        $.getJSON("http://hotshot.dfhuynh.user.dev.freebaseapps.com/html?id=" + id + "&callback=?",
            function(html) {
                var div = __cc_tree_createPopup(elmt);
                $(div).addClass("cuecard-outputPane-tree-popup-topic").html(html);
            }
        );
    };
    window.__cc_tree_mouseOutTopic = function(elmt) {
        __cc_tree_disposePopup();
    };
    
    window.__cc_tree_mouseOverImage = function(elmt) {
        var id = elmt.getAttribute("fbid");
        if (id != null && id.length > 0) {
            var url = CueCard.freebaseServiceUrl + "api/trans/image_thumb" + id + "?mode=fillcrop&amp;maxwidth=100&amp;maxheight=100";
        } else {
            var url = elmt.href;
        }
        var div = __cc_tree_createPopup(elmt);
        div.innerHTML = "<img src='" + url + "' />";
    };
    window.__cc_tree_mouseOutImage = function(elmt) {
        __cc_tree_disposePopup();
    };
    
    window.__cc_tree_mouseOverArticle = function(elmt) {
        var id = elmt.getAttribute("fbid");
        $.getJSON(CueCard.freebaseServiceUrl + "api/trans/blurb" + id + "?callback=?",
            function(data) {
                var text = data.result.body;
                var div = __cc_tree_createPopup(elmt);
                $(div).addClass("cuecard-outputPane-tree-popup-article").html(text);
            }
        );
    };
    window.__cc_tree_mouseOutArticle = function(elmt) {
        __cc_tree_disposePopup();
    };
    
    window.__cc_tree_createPopup = function(elmt) {
        var div = document.getElementById("cuecard-outputPane-tree-popup");
        if (div == null) {
            div = document.createElement("div");
            div.id = "cuecard-outputPane-tree-popup";
            div.className = "cuecard-outputPane-tree-popup";
            div.onmouseover = window.__cc_tree_disposePopup;
            
            document.body.appendChild(div);
        }
        
        var pos = $(elmt).offset();
        div.style.top = (pos.top + elmt.offsetHeight + 10) + "px";
        div.style.left = (pos.left) + "px";
        
        return div;
    };
    window.__cc_tree_disposePopup = function() {
        var div = document.getElementById("cuecard-outputPane-tree-popup");
        if (div != null) {
            div.parentNode.removeChild(div);
        }
    };
})();
/** control-pane.js **/
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

CueCard.ControlPane = function(elmt, options) {
    this._elmt = $(elmt);
    this._options = options || {};
    
    this._constructUI();
};

CueCard.ControlPane.prototype.dispose = function() {
    // TODO
};

CueCard.ControlPane.prototype._constructUI = function() {
    var idPrefix = this._idPrefix = "t" + Math.floor(1000000 * Math.random());
    this._elmt.acre(fb.acre.apps.cuecard + "/control-pane", "tabs", [idPrefix, this]);
    $('#' + idPrefix + " > .section-tabset").tabs('#' + idPrefix + " > .tabbed-content > .cuecard-controlPane-tabBody", { initialIndex: 0 });
};

CueCard.ControlPane.prototype._getDefaults = function() {
    var opts = this._options;
    var env = opts.env || {};
    
    var defaults = {};
    
    defaults.extended = opts.extended || env.extended;
    defaults.extended = (defaults.extended === 1) ? true : false;
    defaults.as_of_time = opts.as_of_time || env.as_of_time || null;
    defaults.use_permission_of = opts.use_permission_of || env.use_permission_of || null;
    
    delete env["extended"];
    delete env["as_of_time"];
    delete env["use_permission_of"];
    
    return defaults;
};

CueCard.ControlPane.prototype._getTab = function(name) {
    return $("#" + this._idPrefix + "-" + name);
};

CueCard.ControlPane.prototype._redangle = function() {
    var self = this;
    
    var m = this._options.queryEditor.getQueryModelAndContext();
    var q = m.model;
    q.toInsideOutQueryJson(m.context, CueCard.UI.createBlockingContinuations(function(cont, q2) {
        self._setOutputJSON(q2);
    }));
};

CueCard.ControlPane.prototype._qualify = function() {
    var self = this;
    
    var m = this._options.queryEditor.getQueryModelAndContext();
    var q = m.model;
    q.qualifyAllProperties(CueCard.UI.createBlockingContinuations(
        function(cont) {
            self._setOutputJSON(q.toQueryJson({qualifyAllProperties:true}));
        }
    ));
};

CueCard.ControlPane.prototype._generateCode = function() {
    var m = this._options.queryEditor.getQueryModelAndContext();
    var q = m.model.toQueryJson();
    var t = CueCard.CodeGeneration.generate(q, CueCard.CodeGeneration.serializers["acre-template"], { variables: this.getVariables() });
    
    CueCard.showDialog("acre_template", t);
};

CueCard.ControlPane.prototype._oneLiner = function() {
    var m = this._options.queryEditor.getQueryModelAndContext();
    var q = m.model.toQueryJson();
    var variables = this.getVariables();
    
    var options = this.getJsonizingSettings({ variables: variables, resolveVariables: false });
    options.breakLines = false;
    
    this._options.queryEditor.content(CueCard.jsonize(q, options));
};

CueCard.ControlPane.prototype._setOutputJSON = function(o) {
    switch (this._getTab("tools").find("input[name='tools-result']:checked").val()) {
        case "replace":
            this._options.queryEditor.content(CueCard.jsonize(o, this.getJsonizingSettings()));
            break;
        case "output":
            this._options.outputPane.setJSONContent(o, this.getJsonizingSettings());
            break;
        }
};

CueCard.ControlPane.prototype._runPage = function(increment) {
    var input = this._getTab("envelope").find("input[name='page']");
    var pageString = input.val();
    var page = parseInt(pageString) || 1;
    page += increment;

    if (page < 1) {
        input.val("1");
        return;
    } else {
        input.val(page);
        if (this._options.queryEditor != null) {
            this._options.queryEditor.run();
        }
    }
};

CueCard.ControlPane.prototype._runCursor = function(auto_run) {
    if (this._options.outputPane != null) {
        var o = this._options.outputPane.getJson();
        if (o !== undefined && o !== null && "cursor" in o) {
            this._getTab("envelope").find("input[name='cursor']").val(o.cursor);
            this._getTab("envelope").find("input[name='cursor-opt'][value='custom']").attr("checked", "checked");

            if (this._options.queryEditor != null && auto_run) {
                this._options.queryEditor.run();
            }
        }
    }
};

CueCard.ControlPane.prototype.getQueryEnvelopeSetting = function(name) {
    switch (name) {
        case "extended":
            return this._getTab("envelope").find("input[name='extended']").attr("checked") ? 1 : 0;
        case "as_of_time":
            var asOfTime = this._getTab("envelope").find("input[name='as_of_time']").val();
            if (asOfTime.length > 0) {
                return asOfTime;
            }
            break;
    }
    return null;
};

CueCard.ControlPane.prototype.getQueryEnvelope = function(e, ignorePaging) {
    e = e || {};
    
    var extended = this.getSetting("extended");
    if (extended == 1) {
        e.extended = 1;
    }
    var asOfTime = this._getTab("envelope").find("input[name='as_of_time']").val();
    if (asOfTime.length > 0) {
        e.as_of_time = asOfTime;
    }
    var usePermissionOf = this._getTab("envelope").find("input[name='use_permission_of']").val();
    if (usePermissionOf.length > 0) {
        e.use_permission_of = usePermissionOf;
    }
    
    var selects = this._getTab("envelope").find("select");
    var getSelectValue = function(i) {
        return selects[i].options[selects[i].selectedIndex].value;
    };
    
    var lang = getSelectValue(0);
    if (lang.length > 0) {
        e.lang = lang;
    }
    
    var escape = getSelectValue(1);
    if (escape.length > 0) {
        e.escape = (escape == "false") ? false : escape;
    }
    
    var uniquenessFailure = getSelectValue(2);
    if (uniquenessFailure.length > 0) {
        e.uniqueness_failure = uniquenessFailure;
    }
    
    if (!(ignorePaging)) {
        var page = this._getTab("envelope").find("input[name='page']").val();
        if (page.length > 0) {
            try {
                e.page = parseInt(page);
            } catch (e) {}
        }
    
        switch (this._getTab("envelope").find("input[name='cursor-opt']:checked").val()) {
            case "true":
                e.cursor = true;
                break;
            case "custom":
                e.cursor = this._getTab("envelope").find("input[name='cursor']").val();
                break;
            }
    }
    
    this.getCustomEnvelope(e); // customize it
    
    return e;
};

CueCard.ControlPane.prototype.getCustomEnvelope = function(env) {
    env = env || {};
    
    var table = this._getTab("customEnvelope").find('table')[0];
    for (var i = 1; i < table.rows.length; i++) {
        var tr = table.rows[i];
        var name = tr.cells[0].firstChild.value;
        var value = tr.cells[1].firstChild.value;
        if (name.length > 0) {
            try {
                value = JSON.parse(value);
            } catch (e) {
            }
            env[name] = value;
        }
    }
    return env;
};

CueCard.ControlPane.prototype.getSetting = function(name) {
    var checkboxes = this._getTab("settings").find("input");
    switch (name) {
        case "cleanup" :
            var r = checkboxes[0].checked;
            $.cookie('cc_cp_clean', r ? "1" : "0", { expires: 365 });
            return r;
        case "alignJSONPropertyValues" :
            var r = checkboxes[1].checked;
            $.cookie('cc_cp_align', r ? "1" : "0", { expires: 365 });
            return r;
        case "liveQuery" :
            var r = checkboxes[2].checked;
            $.cookie('cc_cp_live', r ? "1" : "0", { expires: 365 });
            return r;
        case "multilineErrorMessages" :
            var r = checkboxes[3].checked;
            $.cookie('cc_cp_multi', r ? "1" : "0", { expires: 365 });
            return r;
        case "extended" :
            var extended = this._getTab("envelope").find("input[name='extended']").attr("checked") ? 1 : 0;
            $.cookie('cc_cp_extended', extended, { expires: 365 });
            return extended;
    }
    return false;
};

CueCard.ControlPane.prototype.getJsonizingSettings = function(o) {
    o = o || {};
    o.indentCount = 2;
    o.alignFieldValues = this.getSetting("alignJSONPropertyValues");
    
    return o;
};

CueCard.ControlPane.prototype.getVariables = function() {
    var r = {};
    var table = this._getTab("variables").find('table')[0];
    for (var i = 1; i < table.rows.length; i++) {
        var tr = table.rows[i];
        var name = tr.cells[0].firstChild.value;
        var value = tr.cells[1].firstChild.value;
        try {
            value = JSON.parse(value);
        } catch (e) {
        }
        r[name] = value;
    }
    return r;
};

/** code-generation.js **/
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

CueCard.CodeGeneration = { serializers: {} };

CueCard.CodeGeneration.generate = function(queryJSON, serializer, options) {
    var result = "";
    
    var utils = {
        _variables: {},
        createVariable: function(prefix) {
            if (prefix in this._variables) {
                return prefix + this._variables[prefix]++;
            } else {
                this._variables[prefix] = 1;
                return prefix;
            }
        }
    };
    var qVar = utils.createVariable("q");
    var oVar = utils.createVariable("o");
    
    var context = new CueCard.SerializingContext(null);
    context.setProperty("indentString", "indentString" in options ? options.indentString : "  ");
    context.setProperty("indentLevel", "indentLevel" in options ? options.indentLevel : 0);
    context.setProperty("stream", {
        append: function(s) {
            result += s;
        }
    });
    serializer.prepareRootContext(context, options);
    
    var writer = new CueCard.IndentWriter(context);
    var resultExpr = serializer.generateQueryCall(context, writer, utils, queryJSON, options.variables, qVar, oVar);
    context.setProperty("start", function() {
        return resultExpr;
    });
    context.setProperty("stop", function() {
    });
    
    CueCard.CodeGeneration._processNode(queryJSON, serializer, context, writer, utils);
    
    return result;
};

CueCard.CodeGeneration._deriveElementName = function(type, context) {
    if (type == null) {
        var path = context.getProperty("path");
        if (path != null) {
            if (path.charAt(0) == "!") {
                var segments = path.substr(Math.max(path.indexOf(":") + 1, 1)).split("/");
                return segments[Math.max(0, segments.length - 2)];
            } else {
                var segments = path.substr(path.indexOf(":") + 1).split("/");
                return segments[segments.length - 1];
            }
        }
    } else {
        var segments = type.split("/");
        return segments[segments.length - 1];
    }

    return "entry";
};

CueCard.CodeGeneration._isImagePath = function(path) {
    if (path.charAt(0) == "!") {
        return false;
    }
    path = path.substr(path.indexOf(":") + 1);
    return path == "/common/topic/image" || path == "image";
};

CueCard.CodeGeneration._isImageNode = function(node) {
    if (node == null || typeof node != "object") {
        return false;
    }
    if (node instanceof Array) {
        if (node.length == 1 && typeof node[0] == "object") {
            node = node[0];
        } else {
            return false;
        }
    }
    
    for (var n in node) {
        if (n != "id" && n != "guid" && !CueCard.QueryNode.isMqlKeyword(n)) {
            return false;
        }
    }
    return true;
};

CueCard.CodeGeneration._processNode = function(node, serializer, context, writer, utils) {
    if (node == null) {
        var expr = context.getProperty("start")(true, false);
        serializer.outputSimpleFieldValue(expr, context, writer);
        context.getProperty("stop")(true, false);
    } else if (typeof node != "object") {
        // A constraint value
        return;
    } else if (node instanceof Array) {
        if (node.length == 0) {
            var elementName = CueCard.CodeGeneration._deriveElementName(null, context);
            var elementVar = utils.createVariable(elementName);
            var indexVar = utils.createVariable(elementName.charAt(0));
            
            var expr = context.getProperty("start")(false, false);
            serializer.openNodeArray(context, writer, utils, expr, elementVar, indexVar, "values");
            
            serializer.outputSimpleFieldValue(elementVar, context, writer);
            
            serializer.closeNodeArray(context, writer, utils, expr, elementVar, indexVar, "values");
            context.getProperty("stop")(false, false);
            
        } else if (node.length > 1 || typeof node[0] != "object" || "__identifier__" in node) {
            // An array of constraint values
            return;
        } else {
            var context2 = new CueCard.SerializingContext(context);
            context2.setProperty("in-array", true);
            
            arguments.callee(node[0], serializer, context2, writer, utils);
        }
    } else if (node["optional"] != "forbidden") {
        var type = null;
        
        var fieldCount = 0;
        for (var n in node) {
            if (node.hasOwnProperty(n) && n != "*" && !CueCard.QueryNode.isMqlKeyword(n)) {
                fieldCount++;
                
                var v = node[n];
                if (n.charAt(0) != "!") {
                    var n2 = n.substr(n.indexOf(":") + 1);
                    if (n2 == "type" || n2 == "/type/object/type") {
                        if (v != null && typeof v == "string") {
                            type = v;
                        }
                    }
                }
            }
        }
        
        CueCard.CodeGeneration._processTypedObjectNode(node, type, fieldCount, serializer, context, writer, utils);
    }
};

CueCard.CodeGeneration._processTypedObjectNode = function(node, type, fieldCount, serializer, context, writer, utils) {
    var expr = null;
    var elementVar = null;
    var indexVar = null;
    var start, stop;
    var optional = ("optional" in node && node.optional === true);
    
    function prepareVariables() {
        // This is only called when we really need it, or we will waste variable names.
        
        var elementName = CueCard.CodeGeneration._deriveElementName(type, context);
        elementVar = utils.createVariable(elementName);
        if (context.getProperty("in-array")) {
            indexVar = utils.createVariable(elementName.charAt(0));
        }
    };
    
    if (context.getProperty("in-array")) {
        var elementsAreObjects = (fieldCount > 0 && !("*" in node));
        var start = function() {
            if (expr == null) {
                expr = context.getProperty("start")(false, optional);
                prepareVariables();
                serializer.openNodeArray(context, writer, utils, expr, elementVar, indexVar, elementsAreObjects ? "fields" : "object");
            }
            return elementVar;
        };
        var stop = function() {
            if (expr != null) {
                serializer.closeNodeArray(context, writer, utils, expr, elementVar, indexVar, elementsAreObjects ? "fields" : "object");
                context.getProperty("stop")(false, optional);
            }
        };
    } else {
        var start = function() {
            if (expr == null) {
                expr = context.getProperty("start")(false, optional);
                prepareVariables();
                serializer.openNode(context, writer, utils, expr, elementVar);
            }
            return elementVar;
        };
        var stop = function() {
            if (expr != null) {
                serializer.closeNode(context, writer, utils, expr, elementVar);
                context.getProperty("stop")(false, optional);
            }
        };
    }
    
    if (fieldCount == 0 || "*" in node) {
        serializer.generateEmptyObjectNode(context, writer, utils, start());
    } else {
        for (var n in node) {
            if (node.hasOwnProperty(n) && n != "*" && !CueCard.QueryNode.isMqlKeyword(n)) {
                var v = node[n];
                if (CueCard.CodeGeneration._isImagePath(n) && CueCard.CodeGeneration._isImageNode(v)) {
                    serializer.generateImageField(context, writer, utils, n, v, start);
                } else {
                    var context2 = serializer.createFieldContext(context, writer, utils, n, start);
                    context2.setProperty("path", n);
                    
                    CueCard.CodeGeneration._processNode(v, serializer, context2, writer, utils);
                }
            }
        }
        if ("*" in node) {
            var v = node["*"];
            var context2 = serializer.openWildcardField(context, writer, utils, start, v);
            
            CueCard.CodeGeneration._processNode(v, serializer, context2, writer, utils);
            
            serializer.closeWildcardField(context, writer, utils, start, v);
        }
    }
    stop();
};

CueCard.CodeGeneration.serializers["acre-template"] = {
    prepareRootContext: function(context, options) {
        
    },
    generateQueryCall: function(context, writer, utils, queryJSON, variables, qVar, oVar) {
        writer.appendIndent(); writer.append("<acre:script>"); writer.appendLineBreak();
        writer.indent();
        
        writer.appendIndent(); writer.append('var ' + qVar + ' = ');
            CueCard.jsonize(queryJSON, { context: context, variables: variables, resolveVariables: false });
            writer.append(";"); writer.appendLineBreak();
        writer.appendIndent(); writer.appendLineBreak();
        writer.appendIndent(); writer.append('var ' + oVar + ' = acre.freebase.mqlread(' + qVar +');'); writer.appendLineBreak();
        
        writer.unindent();
        writer.appendIndent(); writer.append("</acre:script>"); writer.appendLineBreak();
        
        return oVar + ".result";
    },
    outputSimpleFieldValue: function(expression, context, writer) {
        writer.append("${" + expression + "}");
    },
    openNodeArray: function(context, writer, utils, expr, elementVar, indexVar, mode) {
        writer.appendLineBreak();
        
        writer.appendIndent(); writer.append('<ul acre:if="' + expr + '.length != 0">'); writer.appendLineBreak();
        writer.indent();
        
        writer.appendIndent(); writer.append('<li acre:for="' + indexVar + ', ' + elementVar + ' in ' + expr + '">');
        if (mode == "fields") {
            writer.append('<table>');
        }
        if (mode == "fields" || mode == "object") {
            writer.appendLineBreak();
            writer.indent();
        }
    },
    closeNodeArray: function(context, writer, utils, expr, elementVar, indexVar, mode) {
        if (mode == "fields" || mode == "object") {
            writer.unindent();
            writer.appendIndent();
        }
        if (mode == "fields") {
            writer.append('</table>');
        }
        writer.append('</li>'); writer.appendLineBreak();
        
        writer.unindent();
        writer.appendIndent(); writer.append('</ul>'); writer.appendLineBreak();
        writer.appendIndent(); writer.append('<div acre:else=""><ins>[no element]</ins></div>'); writer.appendLineBreak();
        
        writer.appendLineBreak();
    },
    openNode: function(context, writer, utils, expr, elementVar) {
        writer.appendIndent(); writer.append('<acre:script>var ' + elementVar + ' = ' + expr + ';</acre:script>'); writer.appendLineBreak();
        writer.appendIndent(); writer.append('<table>'); writer.appendLineBreak();
        writer.indent();
    },
    closeNode: function(context, writer, utils, expr, elementVar) {
        writer.unindent();
        writer.appendIndent(); writer.append('</table>'); writer.appendLineBreak();
    },
    createFieldContext: function(context, writer, utils, fieldPath, start) {
        var context2 = new CueCard.SerializingContext(context);
        context2.setProperty("in-array", false);
        context2.setProperty("start", function(valueIsSimple, optional) {
            var objectVar = start();
            
            writer.appendIndent(); writer.append('<tr><th>' + fieldPath + ':</th>'); writer.appendLineBreak();
            writer.indent();
            
            writer.appendIndent(); writer.append('<td' + 
                (optional ? ' acre:if="\'' + fieldPath + '\' in ' + objectVar + ' && ' + objectVar + '[\'' + fieldPath + '\'] != null"' : '') +
                '>');
            if (!valueIsSimple) {
                writer.appendLineBreak();
                writer.indent();
            }
            return objectVar + '[\'' + fieldPath + '\']';
        });
        context2.setProperty("stop", function(valueIsSimple, optional) {
            if (!valueIsSimple) {
                writer.unindent();
                writer.appendIndent(); 
            }
            writer.append('</td>'); writer.appendLineBreak();
            if (optional) {
                writer.appendIndent(); writer.append('<td acre:else=""><ins>[no value]</ins></td>'); writer.appendLineBreak();
            }
            
            writer.unindent();
            writer.appendIndent(); writer.append('</tr>'); writer.appendLineBreak();
        });
        
        return context2;
    },
    generateImageField: function(context, writer, utils, fieldPath, queryNode, start) {
        var objectVar = start();
        var expr = objectVar + '[\'' + fieldPath + '\']';
        
        writer.appendIndent(); writer.append('<tr><th>' + fieldPath + ':</th>'); writer.appendLineBreak();
        writer.indent();
        
        writer.appendIndent(); writer.append('<td acre:if="\'' + fieldPath + '\' in ' + objectVar + ' && ' + expr + ' != null">'); writer.appendLineBreak();
        writer.indent();
        
        var multiple = (queryNode instanceof Array);
        
        writer.appendIndent();
        if (multiple) {
            queryNode = queryNode[0];
            
            var imageNodeVar = utils.createVariable("image");
            var imageIndexVar = utils.createVariable("i");
            var fieldExpr = ("guid" in queryNode) ? ('/guid/' + '${' + imageNodeVar + ".guid.substr(1)}") : ('${' + imageNodeVar + '.id}');
            
            writer.append(
                '<img acre:for="' + imageIndexVar + ', ' + imageNodeVar + ' in ' + expr + '" ' +
                    'src="${acre.environ.freebase_service_url}/api/trans/image_thumb' + fieldExpr + '?mode=fillcrop&amp;maxwidth=100&amp;maxheight=100" /></td>');
        } else {
            var fieldExpr = ("guid" in queryNode) ? ('/guid/' + '${' + expr + ".guid.substr(1)}") : ('${' + expr + '.id}');
            writer.append(
                '<img src="${acre.environ.freebase_service_url}/api/trans/image_thumb' + fieldExpr + '?mode=fillcrop&amp;maxwidth=100&amp;maxheight=100" /></td>');
        }
        writer.appendLineBreak();
        
        writer.unindent();
        writer.appendIndent(); writer.append('<td acre:else=""><ins>[no image]</ins></td>'); writer.appendLineBreak();
        
        writer.unindent();
        writer.appendIndent(); writer.append('</tr>'); writer.appendLineBreak();
    },
    openWildcardField: function(context, writer, utils, start, valueNode) {
        var objectVar = start();
        var fieldVar = utils.createVariable("field");
        var valueVar = utils.createVariable("value");
        
        writer.appendIndent(); writer.append('<tr acre:for="' + fieldVar + ', ' + valueVar + ' in ' + objectVar + '"><td>${' + fieldVar + '}:</td>'); writer.appendLineBreak();
        writer.indent();
        
        var fieldValueExpr = valueVar;
        
        var context2 = new CueCard.SerializingContext(context);
        context2.setProperty("in-array", false);
        context2.setProperty("start", function(valueIsSimple, optional) {
            writer.appendIndent(); writer.append('<td>');
            if (!valueIsSimple) {
                writer.appendLineBreak();
                writer.indent();
            }
            return fieldValueExpr;
        });
        context2.setProperty("stop", function(valueIsSimple, optional) {
            if (!valueIsSimple) {
                writer.unindent();
                writer.appendIndent(); 
            }
            writer.append('</td>'); writer.appendLineBreak();
        });
        
        return context2;
    },
    closeWildcardField: function(context, writer, utils, start, valueNode) {
        writer.unindent();
        writer.appendIndent(); writer.append('</tr>'); writer.appendLineBreak();
    },
    generateEmptyObjectNode: function(context, writer, utils, expr) {
        var fieldVar = utils.createVariable("field");
        var valueVar = utils.createVariable("value");
        
        writer.appendIndent(); writer.append('<table>'); writer.appendLineBreak();
        writer.indent();

        var fieldValueExpr = valueVar;
        writer.appendIndent(); writer.append('<tr acre:for="' + fieldVar + ', ' + valueVar + ' in ' + expr + '">' +
            '<th>${' + fieldVar + '}:</th>'); writer.appendLineBreak();
        writer.indent();
        
        writer.appendIndent(); writer.append('<td acre:if="' + fieldValueExpr + ' instanceof Array">${' + fieldValueExpr + '.join(\', \')}</td>'); writer.appendLineBreak();
        writer.appendIndent(); writer.append('<td acre:else="">${' + fieldValueExpr + '}</td>'); writer.appendLineBreak();
        
        writer.unindent();
        writer.appendIndent(); writer.append('</tr>'); writer.appendLineBreak();
        
        writer.unindent();
        writer.appendIndent(); writer.append('</table>'); writer.appendLineBreak();
    }
};


/** examples.js **/
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

CueCard.ExampleTechniques = [
    "all",
    "basic",
    "sorting",
    "text search",
    "range constraint",
    "date query",
    "multiple constraints on same property",
    "limiting number of results",
    "geographic location",
    "compound value type (CVT)",
    "schema inspection",
    "attribution",
    "adding data"
];

CueCard.Examples = [
    {   name: "Vietnamese restaurants in Aspen, Colorado",
        query: [{
            "/business/business_location/address" : {
              "citytown" : "Aspen",
              "state_province_region" : "Colorado"
            },
            "cuisine" : "Vietnamese",
            "name" : null,
            "id" : null,
            "type" : "/dining/restaurant"
        }],
        techniques: [ "basic", "geographic location" ]
    },
    {   name: "Properties of /music/artist",
        query: [{
            "id" : "/music/artist",
            "properties" : [{}],
            "type" : "/type/type"
        }],
        techniques: [ "schema inspection" ]
    },
    {   name: "All types created by the user jamie",
        query: [{
            "creator" : "/user/jamie",
            "name" : null,
            "id" : null,
            "type" : "/type/type"
        }],
        techniques: [ "attribution" ]
    },
    {   name: "Cloud classifications sorted by name",
        query: [{
            "clouds" : [],
            "name" : null,
            "id" : null,
            "sort" : "name",
            "type" : "/meteorology/cloud_classification"
        }],
        techniques: [ "basic", "sorting" ]
    },
    {   name: "U.S. states containing cities whose names start with 'Blue' or 'Red'",
        query: [{
            "a:contains" : [{
                "name" : null,
                "id" : null,
                "name~=" : "^Red",
                "type" : "/location/citytown"
            }],
            "b:contains" : [{
                "name" : null,
                "id" : null,
                "name~=" : "^Blue",
                "type" : "/location/citytown"
            }],
            "b:type" : "/location/us_state",
            "name" : null,
            "id" : null,
            "type" : "/location/location"
        }],
        techniques: [ "text search", "multiple constraints on same property" ]
    },
    {   name: "2 of The Police's albums and their tracks",
        query: {
          "album" : [{
              "id" : null,
              "limit" : 2,
              "name" : null,
              "track" : []
          }],
          "id" : null,
          "name" : "The Police",
          "type" : "/music/artist"
        },
        techniques: [ "basic", "limiting number of results" ]
    },
    {   name: "25 Songs with the word 'love' in their titles, with release date, album and artist",
        query: [{
            "album" : {
              "artist" : [],
              "name" : null,
              "id" : null,
              "release_date" : null
            },
            "limit" : 25,
            "name" : null,
            "name~=" : "Love*",
            "type" : "/music/track"
        }],
        techniques: [ "text search", "limiting number of results", "date query" ]
    },
    {   name: "Films starring both Joe Pesci and Robert de Niro, showing their full cast",
        query: [{
            "a:starring" : [{
                "actor" : "Joe Pesci"
            }],
            "b:starring" : [{
                "actor" : "Robert de Niro"
            }],
            "name" : null,
            "id" : null,
            "starring" : [{
                "actor" : null
            }],
            "type" : "/film/film"
        }],
        techniques: [ "multiple constraints on same property", "compound value type (CVT)" ]
    },
    {   name: "32 actors born in the 1960s, with two films of each actor",
        query: [{
            "/people/person/date_of_birth" : null,
            "/people/person/date_of_birth<" : "1970",
            "/people/person/date_of_birth>=" : "1960",
            "film" : [{
                "film" : null,
                "id" : null,
                "limit" : 2
            }],
            "limit" : 35,
            "name" : null,
            "id" : null,
            "type" : "/film/actor"
        }],
        techniques: [ "multiple constraints on same property", "date query", "limiting number of results", "range constraint" ]
    },
    {   name: "Directors who have directed both Parker Posey and any actor named Robert (in possibly different films)",
        query: [{
            "a:film" : [{
                "name" : null,
                "id" : null,
                "starring" : {
                  "actor" : "Parker Posey"
                }
            }],
            "b:film" : [{
                "name" : null,
                "id" : null,
                "starring" : {
                  "actor" : null,
                  "actor~=" : "Robert*"
                }
            }],
            "name" : null,
            "id" : null,
            "type" : "/film/director"
        }],
        techniques: [ "multiple constraints on same property", "text search", "compound value type (CVT)" ]
    },
    {   name: "Music artists with albums containing a track called 'One Tree Hill'",
        query: [{
            "album" : [{
                "name" : null,
                "id" : null,
                "track" : [{
                    "length" : null,
                    "name" : "One Tree Hill"
                }]
            }],
            "name" : null,
            "id" : null,
            "type" : "/music/artist"
        }],
        techniques: [ "compound value type (CVT)", "basic" ]
    },
    {   name: "Everything about 'Jimi Hendrix'",
        query: {
          "*" : null,
          "name" : "Jimi Hendrix",
          "type" : "/music/artist"
        },
        techniques: [ "basic" ]
    },
    {   name: "Kevin Bacon's films, with cast, producers, music, etc.",
        query: [{
            "film" : [{
                "film" : {
                  "imdb_id" : [],
                  "music" : [],
                  "name" : null,
                  "id" : null,
                  "produced_by" : [],
                  "starring" : [{
                      "actor" : [{}]
                  }],
                  "type" : []
                }
            }],
            "name" : "Kevin Bacon",
            "type" : "/film/actor"
        }],
        techniques: [ "basic", "compound value type (CVT)" ]
    },
    {   name: "When 'Star Wars Episode IV' was added to the database, and by whom",
        query: [{
            "creator" : null,
            "id" : "/wikipedia/en/Star_Wars_Episode_IV",
            "name" : null,
            "timestamp" : null,
            "type" : "/film/film"
        }],
        techniques: [ "attribution" ]
    },
    {   name: "Tracks on Synchronicity longer than 300 seconds",
        query: [{
            "artist" : "The Police",
            "name" : "Synchronicity",
            "track" : [{
                "length" : null,
                "length>" : 300,
                "name" : null
            }],
            "type" : "/music/album"
        }],
        techniques: [ "range constraint" ]
    },
    {   name: "Properties of a particular type (/government/politician)",
        query: {
          "id" : "/government/politician",
          "properties" : [],
          "type" : "/type/type"
        },
        techniques: [ "schema inspection" ]
    },
    {   name: "Properties of a particular property (/type/object/name)",
        query: {
          "*" : null,
          "id" : "/type/object/name",
          "type" : "/type/property"
        },
        techniques: [ "schema inspection" ]
    },
    {   name: "Types in a particular domain (/music)",
        query: {
          "id" : "/music",
          "type" : "/type/domain",
          "types" : []
        },
        techniques: [ "schema inspection" ]
    },
    {   name: "Creating a new topic given a name and a type",
        query: {
          "create" : "unless_exists",
          "name" : "Test Object 1",
          "type" : "/base/mqlexamples/testobject",
          "id" : null,
          "guid" : null
        },
        techniques: [ "adding data" ]
    },
    {   name: "Setting a basic unique property to a topic",
        query: {
          "name" : "Test Object 1",
          "type" : "/base/mqlexamples/testobject",
          "id" : null,
          "basic_property" : {
            "value" : 42,
            "connect" : "update"
          }
        },
        techniques: [ "adding data" ]
    },
    {   name: "Connecting one topic to another",
        query: {
          "name" : "Test Object 1",
          "type" : "/base/mqlexamples/testobject",
          "id" : null,
          "link_to_topic" : {
            "name" : "Test Object 2",
            "type" : "/base/mqlexamples/testobject",
            "id" : null,
            "connect" : "insert"
          }
        },
        techniques: [ "adding data" ]
    },
    {   name: "Deleting a link between two topics",
        query: {
          "name" : "Test Object 1",
          "type" : "/base/mqlexamples/testobject",
          "id" : null,
          "link_to_topic" : {
            "name" : "Test Object 2",
            "type" : "/base/mqlexamples/testobject",
            "id" : null,
            "connect" : "delete"
          }
        },
        techniques: [ "adding data" ]
    }
];

CueCard.ExampleTechniqueMap = {
    "all" : []
};

for (var i=0; i < CueCard.Examples.length; i++) {
    var example = CueCard.Examples[i];
    CueCard.ExampleTechniqueMap["all"].push(i);
    for (var x = 0; x < example.techniques.length; x++) {
        var technique = example.techniques[x];
        if (technique in CueCard.ExampleTechniqueMap) {
            CueCard.ExampleTechniqueMap[technique].push(i);
        } else {
            CueCard.ExampleTechniqueMap[technique] = [ i ];
        }
    }
}
/** languages.js **/
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

CueCard.Languages = [
    { name: "Afrikaans", id: "/lang/af" },
    { name: "Akkadian", id: "/lang/kk" },
    { name: "Albanian", id: "/lang/sq" },
    { name: "Amharic", id: "/lang/am" },
    { name: "Arabic", id: "/lang/ar" },
    { name: "Armenian", id: "/lang/hy" },
    { name: "Artificial", id: "/lang/art" },
    { name: "Asturian", id: "/lang/ast" },
    { name: "Australian languages", id: "/lang/aus" },
    { name: "Azerbaijani", id: "/lang/az" },
    { name: "Balinese", id: "/lang/ban" },
    { name: "Bambara", id: "/lang/bm" },
    { name: "Bantu", id: "/lang/bnt" },
    { name: "Basque", id: "/lang/eu" },
    { name: "Batak", id: "/lang/btk" },
    { name: "Belarusian", id: "/lang/be" },
    { name: "Bengali", id: "/lang/bn" },
    { name: "Bhojpuri", id: "/lang/bho" },
    { name: "Bosnian", id: "/lang/bs" },
    { name: "Breton", id: "/lang/br" },
    { name: "Bulgarian", id: "/lang/bg" },
    { name: "Buriat", id: "/lang/bua" },
    { name: "Catalan", id: "/lang/ca" },
    { name: "Cebuano", id: "/lang/ceb" },
    { name: "Cherokee", id: "/lang/chr" },
    { name: "Chichewa", id: "/lang/ny" },
    { name: "Chinese", id: "/lang/zh" },
    { name: "Cornish", id: "/lang/kw" },
    { name: "Corsican", id: "/lang/co" },
    { name: "Cree", id: "/lang/cr" },
    { name: "Creoles", id: "/lang/cpf" },
    { name: "Croatian", id: "/lang/hr" },
    { name: "Czech", id: "/lang/cs" },
    { name: "Danish", id: "/lang/da" },
    { name: "Duala", id: "/lang/dua" },
    { name: "Dutch", id: "/lang/nl" },
    { name: "English", id: "/lang/en" },
    { name: "Esperanto", id: "/lang/eo" },
    { name: "Estonian", id: "/lang/et" },
    { name: "Faroese", id: "/lang/fo" },
    { name: "Filipino", id: "/lang/fil" },
    { name: "Finnish", id: "/lang/fi" },
    { name: "French", id: "/lang/fr" },
    { name: "Frisian", id: "/lang/fy" },
    { name: "Friulian", id: "/lang/fur" },
    { name: "Fulah", id: "/lang/ff" },
    { name: "Ga", id: "/lang/gaa" },
    { name: "Gaelic", id: "/lang/gd" },
    { name: "Gallegan", id: "/lang/gl" },
    { name: "Georgian", id: "/lang/ka" },
    { name: "German", id: "/lang/de" },
    { name: "Germanic", id: "/lang/gem" },
    { name: "Greek", id: "/lang/el" },
    { name: "Guarani", id: "/lang/gn" },
    { name: "Haitian", id: "/lang/ht" },
    { name: "Hausa", id: "/lang/ha" },
    { name: "Hawaiian", id: "/lang/haw" },
    { name: "Hebrew", id: "/lang/he" },
    { name: "Hindi", id: "/lang/hi" },
    { name: "Hungarian", id: "/lang/hu" },
    { name: "Icelandic", id: "/lang/is" },
    { name: "Indonesian", id: "/lang/id" },
    { name: "Inuktitut", id: "/lang/ku" },
    { name: "Inuktitut", id: "/lang/iu" },
    { name: "Irish", id: "/lang/ga" },
    { name: "Italian", id: "/lang/it" },
    { name: "Japanese", id: "/lang/ja" },
    { name: "Judeo-Arabic", id: "/lang/jrb" },
    { name: "Kalaallisut", id: "/lang/kl" },
    { name: "Khmer", id: "/lang/km" },
    { name: "Kinyarwanda", id: "/lang/rw" },
    { name: "Klingon", id: "/lang/tlh" },
    { name: "Kongo", id: "/lang/kg" },
    { name: "Korean", id: "/lang/ko" },
    { name: "Ladino", id: "/lang/lad" },
    { name: "Latin", id: "/lang/la" },
    { name: "Latvian", id: "/lang/lv" },
    { name: "Limburgan", id: "/lang/li" },
    { name: "Lingala", id: "/lang/ln" },
    { name: "Lithuanian", id: "/lang/lt" },
    { name: "Low German", id: "/lang/nds" },
    { name: "Luxembourgish", id: "/lang/lb" },
    { name: "Macedonian", id: "/lang/mk" },
    { name: "Malagasy", id: "/lang/mg" },
    { name: "Malay", id: "/lang/ms" },
    { name: "Malayalam", id: "/lang/ml" },
    { name: "Maltese", id: "/lang/mt" },
    { name: "Mandingo", id: "/lang/man" },
    { name: "Manx", id: "/lang/gv" },
    { name: "Maori", id: "/lang/mi" },
    { name: "Marathi", id: "/lang/mr" },
    { name: "Mohawk", id: "/lang/moh" },
    { name: "Moldavian", id: "/lang/mo" },
    { name: "Mongolian", id: "/lang/mn" },
    { name: "Nahuatl", id: "/lang/nah" },
    { name: "Navajo", id: "/lang/nv" },
    { name: "Neapolitan", id: "/lang/nap" },
    { name: "Nepali", id: "/lang/ne" },
    { name: "Norse,", id: "/lang/non" },
    { name: "Northern Sami", id: "/lang/se" },
    { name: "Norwegian", id: "/lang/no" },
    { name: "Norwegian Nynorsk", id: "/lang/nn" },
    { name: "Occitan", id: "/lang/oc" },
    { name: "Panjabi", id: "/lang/pa" },
    { name: "Papiamento", id: "/lang/pap" },
    { name: "Persian", id: "/lang/fa" },
    { name: "Polish", id: "/lang/pl" },
    { name: "Portuguese", id: "/lang/pt" },
    { name: "Pushto", id: "/lang/ps" },
    { name: "Quechua", id: "/lang/qu" },
    { name: "Raeto-Romance", id: "/lang/rm" },
    { name: "Romanian", id: "/lang/ro" },
    { name: "Romany", id: "/lang/rom" },
    { name: "Russian", id: "/lang/ru" },
    { name: "Sakha", id: "/lang/sah" },
    { name: "Sanskrit", id: "/lang/sa" },
    { name: "Sardinian", id: "/lang/sc" },
    { name: "Scots", id: "/lang/sco" },
    { name: "Serbian", id: "/lang/sr" },
    { name: "Shona", id: "/lang/sn" },
    { name: "Sicilian", id: "/lang/scn" },
    { name: "Slovak", id: "/lang/sk" },
    { name: "Slovenian", id: "/lang/sl" },
    { name: "Songhai", id: "/lang/son" },
    { name: "Spanish", id: "/lang/es" },
    { name: "Sundanese", id: "/lang/su" },
    { name: "Swahili", id: "/lang/sw" },
    { name: "Swedish", id: "/lang/sv" },
    { name: "Syriac", id: "/lang/syr" },
    { name: "Tagalog", id: "/lang/tl" },
    { name: "Tahitian", id: "/lang/ty" },
    { name: "Tajik", id: "/lang/tg" },
    { name: "Tamashek", id: "/lang/tmh" },
    { name: "Tamil", id: "/lang/ta" },
    { name: "Telugu", id: "/lang/te" },
    { name: "Thai", id: "/lang/th" },
    { name: "Tibetan", id: "/lang/bo" },
    { name: "Tonga", id: "/lang/to" },
    { name: "Turkish", id: "/lang/tr" },
    { name: "Turkmen", id: "/lang/tk" },
    { name: "Tuvinian", id: "/lang/tyv" },
    { name: "Ukrainian", id: "/lang/uk" },
    { name: "Urdu", id: "/lang/ur" },
    { name: "Uzbek", id: "/lang/uz" },
    { name: "Vietnamese", id: "/lang/vi" },
    { name: "Welsh", id: "/lang/cy" },
    { name: "Wolof", id: "/lang/wo" },
    { name: "Xhosa", id: "/lang/xh" },
    { name: "Yiddish", id: "/lang/yi" },
    { name: "Yoruba", id: "/lang/yo" },
    { name: "Zulu", id: "/lang/zu" }
];
/** x-metaweb-costs.js **/
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

CueCard.XMetawebCosts = {
    'tu': { meaning: 'time/user', subsystem: 'graphd' },
    'ts': { meaning: 'time/system', subsystem: 'graphd' },
    'tr': { meaning: 'time/real', subsystem: 'graphd' },
    'te': { meaning: 'time/overall', subsystem: 'graphd' },
    'pr': { meaning: 'page reclaims', subsystem: 'graphd' },
    'pf': { meaning: 'page faults', subsystem: 'graphd' },
    'dw': { meaning: 'primitive data writes', subsystem: 'graphd' },
    'dr': { meaning: 'primitive data reads', subsystem: 'graphd' },
    'in': { meaning: 'index size reads', subsystem: 'graphd' },
    'ir': { meaning: 'index element reads', subsystem: 'graphd' },
    'iw': { meaning: 'index element write', subsystem: 'graphd' },
    'va': { meaning: 'value allocation', subsystem: 'graphd' },
    
    'dt': { meaning: 'total time spent in the session', subsystem: 'client/me' },
    'mr': { meaning: 'number of mql requests (independent of caches)', subsystem: 'client/me' },
    'ch': { meaning: 'cache/hit (memcache, not Squid)', subsystem: 'client/me', important: true },
    'cm': { meaning: 'cache/miss (memcache, not Squid)', subsystem: 'client/me' },
    'cr': { meaning: 'cache/read (memcache, not Squid)', subsystem: 'client/me' },
    'cs': { meaning: 'cache skip (browser shift+reload skips memcache)', subsystem: 'client/me' },
    'lh': { meaning: 'lojson-cache/hit', subsystem: 'client/me' },
    'lm': { meaning: 'lojson-cache/miss', subsystem: 'client/me' },
    'lr': { meaning: 'lojson-cache/read', subsystem: 'client/me' },
    'nreqs': { meaning: 'graph requests', subsystem: 'client/me', important: true },
    'tf': { meaning: 'time/formatted', subsystem: 'client/me' },
    'tg': { meaning: 'time/graph', subsystem: 'client/me', important: true },
    'rt': { meaning: 'relevance/time', subsystem: 'client/me' },
    'cc': { meaning: 'cpu time (utime + stime)', subsystem: 'client/me' },
    'mcu': { meaning: 'mql user time', subsystem: 'client/me' },
    'mcs': { meaning: 'mql system time', subsystem: 'client/me' },
    'tm': { meaning: 'mql real time', subsystem: 'client/me', important: true },
    'utime': { meaning: 'time in user mode (float)', subsystem: 'client/me' },
    'stime': { meaning: 'time in system mode (float)', subsystem: 'client/me' },
    'maxrss': { meaning: 'maximum resident set size', subsystem: 'client/me' },
    'ixrss': { meaning: 'shared memory size', subsystem: 'client/me' },
    'idrss': { meaning: 'unshared memory size', subsystem: 'client/me' },
    'isrss': { meaning: 'unshared stack size', subsystem: 'client/me' },
    'minflt': { meaning: 'page faults not requiring I/O', subsystem: 'client/me' },
    'majflt': { meaning: 'page faults requiring I/O', subsystem: 'client/me' },
    'nswap': { meaning: 'number of swap outs', subsystem: 'client/me' },
    'inblock': { meaning: 'block input operations', subsystem: 'client/me' },
    'oublock': { meaning: 'block output operations', subsystem: 'client/me' },
    'msgsnd': { meaning: 'messages sent', subsystem: 'client/me' },
    'msgrcv': { meaning: 'messages received', subsystem: 'client/me' },
    'nsignals': { meaning: 'signals received', subsystem: 'client/me' },
    'nvcsw': { meaning: 'voluntary context switches', subsystem: 'client/me' },
    'nivcsw': { meaning: 'involuntary context switches', subsystem: 'client/me' },
    'br': { meaning: 'number of blob requests', subsystem: 'client/me' },
    'bctn': { meaning: 'cdb thumbnail time - from blobclient POV', subsystem: 'client/me' },
    
    'rt': { meaning: 'relevance/time (FIX: same name, different semantics?)', subsystem: 'gix' },
    'pt': { meaning: 'postgres time', subsystem: 'gix' },
    'qt': { meaning: 'actual postgres query time', subsystem: 'gix' },
    'ct': { meaning: 'postgres connect time', subsystem: 'gix' },
    'mt': { meaning: 'MQL time', subsystem: 'gix' },
    
    'tt': { meaning: 'total time', subsystem: 'other' },
    'mt': { meaning: 'total MQL time: mql_output + mql_filter', subsystem: 'other' },
    'mft': { meaning: 'MQL filter time (total time, ie. not per invocation)', subsystem: 'other' },
    'mfc': { meaning: 'number of mql_filter invocations', subsystem: 'other' },
    
    'sh': { meaning: 'squid/hit', subsystem: 'cache' },
    'st': { meaning: 'squid/total time', subsystem: 'cache' },
    'so': { meaning: 'squid/origin server time', subsystem: 'cache' }
};
/** dialogs **/
if (jQuery) {
jQuery(window).trigger('acre.template.register', {pkgid: '//62b.cuecard.site.tags.svn.freebase-site.googlecode.dev/dialogs', source: {def: (function () {// mjt.def=rawmain()
var rawmain = function () {
var __pkg = this.tpackage;
var exports = this.exports;
var __ts=__pkg._template_fragments;
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[0];                               // 
// mjt.def=acre_template(t)
var acre_template = function (t) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[1];                               // 
                                                  //   <div class="modal-inner">
                                                  //     <h1 class="modal-title">
                                                  //       <span>Generated Acre Template</span>
                                                  //     </h1>
                                                  //     <div class="modal-content">
                                                  //       <textarea id="template-code" wrap="off">
__m[__n++]=t;
__m[__n++]=__ts[2];                               // </textarea>
                                                  //     </div>
                                                  //   </div>
                                                  //   <div class="modal-buttons">
                                                  //     <button class="button button-cancel">OK</button>
                                                  //   </div>
return __m;
};
acre_template = __pkg.runtime.tfunc_factory("acre_template(t)", acre_template, __pkg, undefined, false);
exports.acre_template = acre_template;
acre_template.source_microdata = null;
__m[__n++]=__ts[3];                               // 
// mjt.def=examples(opts)
var examples = function (opts) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[4];                               // 
// mjt.def=list_techniques(selected_technique)
var list_techniques = function (selected_technique) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[5];                               // 
__pkg.runtime.foreach(this, (CueCard.ExampleTechniques), function (technique_index_1, technique) {
var once_1 = 1;
while (once_1) {
__m[__n++]=__ts[6];                               // 
                                                  //     <a class="
__m[__n++]=__pkg.runtime.make_attr_safe((technique === selected_technique) ? 'cuecard-examples-technique-selected' : 'cuecard-examples-technique');
__m[__n++]=__ts[7];                               // " href="javascript:selectTechnique('
__m[__n++]=__pkg.runtime.make_attr_safe(technique);
__m[__n++]=__ts[8];                               // ')">
                                                  //       
__m[__n++]=technique;
__m[__n++]=__ts[9];                               //  (
__m[__n++]=(CueCard.ExampleTechniqueMap[technique].length);
__m[__n++]=__ts[10];                              // )
                                                  //     </a>
once_1--;
} /* while once */
return once_1 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[11];                              // 
return __m;
};
list_techniques = __pkg.runtime.tfunc_factory("list_techniques(selected_technique)", list_techniques, __pkg, undefined, false);
list_techniques.source_microdata = null;
__m[__n++]=__ts[12];                              // 
// mjt.def=list_examples(technique)
var list_examples = function (technique) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[13];                              // 
__pkg.runtime.foreach(this, (CueCard.Examples), function (index, example) {
var once_2 = 1;
while (once_2) {
if (((technique !== 'all') ? (example.techniques.indexOf(technique) !== -1) : true)) {
__m[__n++]=__ts[14];                              // 
                                                  //     <a class="cuecard-examples-example" href="javascript:selectExample('
__m[__n++]=__pkg.runtime.make_attr_safe(index);
__m[__n++]=__ts[15];                              // ')" id="cuecard-example-
__m[__n++]=__pkg.runtime.make_attr_safe(index);
__m[__n++]=__ts[16];                              // ">
                                                  //       
__m[__n++]=example.name;
__m[__n++]=__ts[17];                              // 
                                                  //     </a>
}
once_2--;
} /* while once */
return once_2 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[18];                              // 
return __m;
};
list_examples = __pkg.runtime.tfunc_factory("list_examples(technique)", list_examples, __pkg, undefined, false);
list_examples.source_microdata = null;
__m[__n++]=__ts[19];                              // 
                                                  // 
                                                  //   <div class="modal-inner">
                                                  //     <h1 class="modal-title">
                                                  //       <span>Examples</span>
                                                  //     </h1>
                                                  //     <div class="modal-content" id="cuecard-examples-dialog">
                                                  //       <div class="cuecard-examples-dialog-columnHeader cuecard-examples-dialog-column-0">Techniques</div>
                                                  //       <div class="cuecard-examples-dialog-columnHeader cuecard-examples-dialog-column-1">Examples</div>
                                                  //       <div class="cuecard-examples-dialog-columnHeader cuecard-examples-dialog-column-2">Query</div>
                                                  //       <div class="cuecard-examples-dialog-columnBody cuecard-examples-dialog-column-0"></div>
                                                  //       <div class="cuecard-examples-dialog-columnBody cuecard-examples-dialog-column-1"></div>
                                                  //       <textarea class="cuecard-examples-dialog-columnBody cuecard-examples-dialog-column-2 cuecard-examples-query" readonly="true" wrap="off">
                                                  //     </textarea></div>
                                                  //   </div>
                                                  //   
                                                  //   <div class="modal-buttons">
                                                  //     <button class="button button-submit" id="examples-submit" type="submit">Paste &amp; Run</button>
                                                  //     <button class="button button-cancel">Cancel</button>
                                                  //   </div>
__pkg.runtime.ondomready(function () {

    var height = $("#dialog-examples").height() - $("#dialog-examples .modal-title").height() - $("#dialog-examples .modal-buttons").height();
    $("#cuecard-examples-dialog").height(height - 50);
  
    selectTechnique = function(technique) {
      technique = technique || 'all';
      $(".cuecard-examples-dialog-columnBody.cuecard-examples-dialog-column-0").acre(list_techniques(technique));
      $(".cuecard-examples-dialog-columnBody.cuecard-examples-dialog-column-1").acre(list_examples(technique));
      return false;
    }
  
    selectExample = function(index) {
      $(".cuecard-examples-example").removeClass("cuecard-examples-example-selected");
      $("#cuecard-example-" + index).addClass("cuecard-examples-example-selected");
      $("#cuecard-examples-dialog").find("textarea").val(CueCard.jsonize(CueCard.Examples[index].query, { indentCount: 2 }));
      return false;
    }
  
    selectTechnique();
    
    $("#examples-submit").click(function(){
      var q = $('#cuecard-examples-dialog').find('textarea').val();
      opts.onDone(q);
    });
  
}, this);
__m[__n++]=__ts[20];                              // 
return __m;
};
examples = __pkg.runtime.tfunc_factory("examples(opts)", examples, __pkg, undefined, false);
exports.examples = examples;
examples.source_microdata = null;
return __m;
};
rawmain.source_microdata = null;
; return rawmain;})(),
info:{"file":"//62b.cuecard.site.tags.svn.freebase-site.googlecode.dev/dialogs","stringtable":["","\n  <div class=\"modal-inner\">\n    <h1 class=\"modal-title\">\n      <span>Generated Acre Template</span>\n    </h1>\n    <div class=\"modal-content\">\n      <textarea id=\"template-code\" wrap=\"off\">","</textarea>\n    </div>\n  </div>\n  <div class=\"modal-buttons\">\n    <button class=\"button button-cancel\">OK</button>\n  </div>","","","","\n    <a class=\"","\" href=\"javascript:selectTechnique('","')\">\n      "," (",")\n    </a>","","","","\n    <a class=\"cuecard-examples-example\" href=\"javascript:selectExample('","')\" id=\"cuecard-example-","\">\n      ","\n    </a>","","\n\n  <div class=\"modal-inner\">\n    <h1 class=\"modal-title\">\n      <span>Examples</span>\n    </h1>\n    <div class=\"modal-content\" id=\"cuecard-examples-dialog\">\n      <div class=\"cuecard-examples-dialog-columnHeader cuecard-examples-dialog-column-0\">Techniques</div>\n      <div class=\"cuecard-examples-dialog-columnHeader cuecard-examples-dialog-column-1\">Examples</div>\n      <div class=\"cuecard-examples-dialog-columnHeader cuecard-examples-dialog-column-2\">Query</div>\n      <div class=\"cuecard-examples-dialog-columnBody cuecard-examples-dialog-column-0\"></div>\n      <div class=\"cuecard-examples-dialog-columnBody cuecard-examples-dialog-column-1\"></div>\n      <textarea class=\"cuecard-examples-dialog-columnBody cuecard-examples-dialog-column-2 cuecard-examples-query\" readonly=\"true\" wrap=\"off\">\n    </textarea></div>\n  </div>\n  \n  <div class=\"modal-buttons\">\n    <button class=\"button button-submit\" id=\"examples-submit\" type=\"submit\">Paste &amp; Run</button>\n    <button class=\"button button-cancel\">Cancel</button>\n  </div>",""],"debug_locs":[1,1,1,1,1,1,6,6,6,6,12,12,12,12,12,12,12,12,18,18,18,18,18,18,18,18,18,18,18,20,20,20,20,22,22,22,22,24,24,24,24,24,24,24,24,24,25,25,25,25,25,26,26,26,26,26,26,27,27,27,27,27,29,29,29,29,31,31,31,31,31,31,31,31,31,31,32,32,32,33,33,33,33,33,33,33,34,34,34,34,34,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,81,81,81,81,81,81,81,81],"output_mode":"html"}}
});
}

/** query-editor **/
if (jQuery) {
jQuery(window).trigger('acre.template.register', {pkgid: '//62b.cuecard.site.tags.svn.freebase-site.googlecode.dev/query-editor', source: {def: (function () {// mjt.def=rawmain()
var rawmain = function () {
var __pkg = this.tpackage;
var exports = this.exports;
var __ts=__pkg._template_fragments;
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[0];                               // 
// mjt.def=query_editor(queryEditor, codeMirrorOptions)
var query_editor = function (queryEditor, codeMirrorOptions) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[1];                               // 
                                                  // 
                                                  //   <div class="cuecard-queryEditor-inner">
                                                  //     <div class="cuecard-queryEditor-controls-top">
                                                  //       <table cellpadding="0" cellspacing="0" width="100%"><tr>
                                                  //         <td class="cuecard-queryEditor-controls-leftAligned">
var onclick_cb_1 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_1] = function (event) {
queryEditor._showExamples()}
__m[__n++]=__ts[2];                               // 
                                                  //           <button class="button cuecard-queryEditor-examples" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_1);
__m[__n++]=__ts[3];                               // .apply(this, [event])">
                                                  //             Examples...
                                                  //           </button>
                                                  //         </td>
                                                  //         <td class="cuecard-queryEditor-controls-leftAligned">
                                                  //           <span>
                                                  //             <a href="http://www.freebase.com/docs/data" target="_blank">MQL Tutorial</a> • <a href="http://www.freebase.com/docs/mql" target="_blank">MQL Reference</a>
                                                  //           </span>
                                                  //         </td>
                                                  //         <td width="99%"></td>
                                                  //         <td class="cuecard-queryEditor-controls-rightAligned">
var onclick_cb_2 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_2] = function (event) {
queryEditor._editor.editor.history.undo()}
__m[__n++]=__ts[4];                               // 
                                                  //           <button class="button cuecard-queryEditor-undo" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_2);
__m[__n++]=__ts[5];                               // .apply(this, [event])">
                                                  //             Undo
                                                  //           </button>
                                                  //         </td>
                                                  //         <td class="cuecard-queryEditor-controls-rightAligned">
var onclick_cb_3 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_3] = function (event) {
queryEditor._editor.editor.history.redo()}
__m[__n++]=__ts[6];                               // 
                                                  //           <button class="button cuecard-queryEditor-redo" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_3);
__m[__n++]=__ts[7];                               // .apply(this, [event])">
                                                  //             Redo
                                                  //           </button>
                                                  //         </td>
                                                  //         <td class="cuecard-queryEditor-controls-rightAligned">
var onclick_cb_4 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_4] = function (event) {
queryEditor.content(''); queryEditor.focus();}
__m[__n++]=__ts[8];                               // 
                                                  //           <button class="button cuecard-queryEditor-redo" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_4);
__m[__n++]=__ts[9];                               // .apply(this, [event])">
                                                  //             Clear
                                                  //           </button>
                                                  //         </td>
                                                  //       </tr></table>
                                                  //     </div>
                                                  //     <div class="cuecard-queryEditor-content"></div>
                                                  //     <div class="cuecard-queryEditor-controls-bottom">
                                                  //       <table cellpadding="0" cellspacing="0" width="100%"><tr>
                                                  //         <td class="cuecard-queryEditor-controls-leftAligned">
var onclick_cb_5 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_5] = function (event) {
queryEditor.startAssistAtCursor()}
__m[__n++]=__ts[10];                              // 
                                                  //           <button class="button button-primary cuecard-queryEditor-queryAssist" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_5);
__m[__n++]=__ts[11];                              // .apply(this, [event])">
                                                  //             Query Assist
                                                  //           </button>
                                                  //           <span class="cuecard-queryEditor-buttonHint">Tab</span>
                                                  //         </td>
                                                  //         <td width="90%"></td>
                                                  //         <td class="cuecard-queryEditor-controls-rightAligned">
var onclick_cb_6 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_6] = function (event) {
queryEditor._onCleanUp()}
__m[__n++]=__ts[12];                              // 
                                                  //           <button class="button cuecard-queryEditor-cleanUp" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_6);
__m[__n++]=__ts[13];                              // .apply(this, [event])">
                                                  //             Clean Up
                                                  //           </button>
                                                  //         </td>
                                                  //         <td class="cuecard-queryEditor-controls-rightAligned">
var onclick_cb_7 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_7] = function (event) {
queryEditor._onRun(false)}
__m[__n++]=__ts[14];                              // 
                                                  //           <button class="button button-primary cuecard-queryEditor-run" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_7);
__m[__n++]=__ts[15];                              // .apply(this, [event])">
                                                  //             Run
                                                  //           </button>
                                                  //           <span class="cuecard-queryEditor-buttonHint">Ctrl-Enter</span>
                                                  //         </td>
                                                  //       </tr></table>
                                                  //     </div>
                                                  //   </div>
__pkg.runtime.ondomready(function () {

    var el = $(queryEditor._container);
    queryEditor._controlTopContainer = el.find(".cuecard-queryEditor-controls-top");
    queryEditor._iframeContainer = el.find(".cuecard-queryEditor-content");
    queryEditor._controlBottomContainer = el.find(".cuecard-queryEditor-controls-bottom");
    queryEditor._addCodemirror(el.find(".cuecard-queryEditor-content"), codeMirrorOptions);
    
    queryEditor.layout = function(){
      var height = el.height() - 
                   queryEditor._controlTopContainer[0].offsetHeight - 
                   queryEditor._controlBottomContainer[0].offsetHeight;

      queryEditor._iframeContainer.height(height).css("top", queryEditor._controlTopContainer[0].offsetHeight);
    };    
    queryEditor.layout();
  
}, this);
__m[__n++]=__ts[16];                              // 
return __m;
};
query_editor = __pkg.runtime.tfunc_factory("query_editor(queryEditor, codeMirrorOptions)", query_editor, __pkg, undefined, false);
exports.query_editor = query_editor;
query_editor.source_microdata = null;
return __m;
};
rawmain.source_microdata = null;
; return rawmain;})(),
info:{"file":"//62b.cuecard.site.tags.svn.freebase-site.googlecode.dev/query-editor","stringtable":["","\n\n  <div class=\"cuecard-queryEditor-inner\">\n    <div class=\"cuecard-queryEditor-controls-top\">\n      <table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\"><tr>\n        <td class=\"cuecard-queryEditor-controls-leftAligned\">","\n          <button class=\"button cuecard-queryEditor-examples\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n            Examples...\n          </button>\n        </td>\n        <td class=\"cuecard-queryEditor-controls-leftAligned\">\n          <span>\n            <a href=\"http://www.freebase.com/docs/data\" target=\"_blank\">MQL Tutorial</a> • <a href=\"http://www.freebase.com/docs/mql\" target=\"_blank\">MQL Reference</a>\n          </span>\n        </td>\n        <td width=\"99%\"></td>\n        <td class=\"cuecard-queryEditor-controls-rightAligned\">","\n          <button class=\"button cuecard-queryEditor-undo\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n            Undo\n          </button>\n        </td>\n        <td class=\"cuecard-queryEditor-controls-rightAligned\">","\n          <button class=\"button cuecard-queryEditor-redo\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n            Redo\n          </button>\n        </td>\n        <td class=\"cuecard-queryEditor-controls-rightAligned\">","\n          <button class=\"button cuecard-queryEditor-redo\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n            Clear\n          </button>\n        </td>\n      </tr></table>\n    </div>\n    <div class=\"cuecard-queryEditor-content\"></div>\n    <div class=\"cuecard-queryEditor-controls-bottom\">\n      <table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\"><tr>\n        <td class=\"cuecard-queryEditor-controls-leftAligned\">","\n          <button class=\"button button-primary cuecard-queryEditor-queryAssist\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n            Query Assist\n          </button>\n          <span class=\"cuecard-queryEditor-buttonHint\">Tab</span>\n        </td>\n        <td width=\"90%\"></td>\n        <td class=\"cuecard-queryEditor-controls-rightAligned\">","\n          <button class=\"button cuecard-queryEditor-cleanUp\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n            Clean Up\n          </button>\n        </td>\n        <td class=\"cuecard-queryEditor-controls-rightAligned\">","\n          <button class=\"button button-primary cuecard-queryEditor-run\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n            Run\n          </button>\n          <span class=\"cuecard-queryEditor-buttonHint\">Ctrl-Enter</span>\n        </td>\n      </tr></table>\n    </div>\n  </div>",""],"debug_locs":[1,1,1,1,1,1,7,7,7,7,14,14,14,14,14,14,14,14,14,14,14,14,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,32,32,32,32,32,32,32,32,32,32,32,38,38,38,38,38,38,38,38,38,38,38,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,57,57,57,57,57,57,57,57,57,57,57,57,57,63,63,63,63,63,63,63,63,63,63,63,72,72,72,72,72,72,72,72,72,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,90,90,90,90,90,90,90,90,90],"output_mode":"html"}}
});
}

/** control-pane **/
if (jQuery) {
jQuery(window).trigger('acre.template.register', {pkgid: '//62b.cuecard.site.tags.svn.freebase-site.googlecode.dev/control-pane', source: {def: (function () {// mjt.def=rawmain()
var rawmain = function () {
var __pkg = this.tpackage;
var exports = this.exports;
var __ts=__pkg._template_fragments;
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[0];                               // 
// mjt.def=tabs(id, controlPane)
var tabs = function (id, controlPane) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[1];                               // 

    var TABS = [
      { name: 'Tools', template: tools, key: "tools"},
      { name: 'Variables', template: variables, key: "variables"}, 
      { name: 'Envelope', template: envelope, key: "envelope"}, 
      { name: 'Custom Envelope', template: custom_envelope, key: "customEnvelope"}, 
      { name: 'Settings', template: settings, key: "settings"}
    ];
  
__m[__n++]=__ts[2];                               // 
                                                  // 
                                                  //   <div class="cuecard-controlPane section-tabs">
                                                  //     <div id="
__m[__n++]=__pkg.runtime.make_attr_safe(id);
__m[__n++]=__ts[3];                               // ">
                                                  //       <ul class="section-tabset clear">
__pkg.runtime.foreach(this, (TABS), function (index, tab) {
var once_1 = 1;
while (once_1) {
__m[__n++]=__ts[4];                               // 
                                                  //         <li class="section-tab tab">
                                                  //           <a href="#
__m[__n++]=__pkg.runtime.make_attr_safe(id);
__m[__n++]=__ts[5];                               // -
__m[__n++]=__pkg.runtime.make_attr_safe(tab.key);
__m[__n++]=__ts[6];                               // "><span>
__m[__n++]=tab.name;
__m[__n++]=__ts[7];                               // </span></a>
                                                  //         </li>
once_1--;
} /* while once */
return once_1 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[8];                               // 
                                                  //       </ul>
                                                  //       <div class="tabbed-content">
__pkg.runtime.foreach(this, (TABS), function (tab_index_1, tab) {
var once_2 = 1;
while (once_2) {
__m[__n++]=__ts[9];                               // 
                                                  //         <div class="cuecard-controlPane-tabBody" id="
__m[__n++]=__pkg.runtime.make_attr_safe(id);
__m[__n++]=__ts[10];                              // -
__m[__n++]=__pkg.runtime.make_attr_safe(tab.key);
__m[__n++]=__ts[11];                              // ">
                                                  //           
__m[__n++]=(tab.template(controlPane));
__m[__n++]=__ts[12];                              // 
                                                  //         </div>
once_2--;
} /* while once */
return once_2 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[13];                              // 
                                                  //       </div>
                                                  //     </div>
                                                  //   </div>
__pkg.runtime.ondomready(function () {

    controlPane.layout = function(){
      var el = this._elmt;
      var height = el.find('.section-tabs').innerHeight() - el.find('.section-tabset').outerHeight();
      el.find('.cuecard-controlPane-tabBody').css("height", height);      
    }
    controlPane.layout();
  
}, this);
__m[__n++]=__ts[14];                              // 
return __m;
};
tabs = __pkg.runtime.tfunc_factory("tabs(id, controlPane)", tabs, __pkg, undefined, false);
exports.tabs = tabs;
tabs.source_microdata = null;
__m[__n++]=__ts[15];                              // 
// mjt.def=tools(controlPane)
var tools = function (controlPane) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[16];                              // 

    var BUTTONS = [
      {
        label: 'Qualify All Properties',
        command: '_qualify',
        hint: 'Expand all properties to their full IDs (e.g., "id" → "/type/object/id").'
      },
      {
        label: 'Turn Inside Out',
        command: '_redangle',
        hint: 'Take the inner most query node {...} that contains the text cursor and make it the outermost query node.'
      },
      {
        label: 'Generate Acre Template',
        command: '_generateCode',
        hint: 'Generate an ACRE template that can render the result of this query.'
      },
      {
        label: 'One-liner',
        command: '_oneLiner', 
        hint: 'Reformat query into a one-liner.'
      }
    ];
  
__m[__n++]=__ts[17];                              // 
                                                  // 
                                                  //   <div class="cuecard-controlPane-section">
                                                  //     <table><tr valign="top">
                                                  //       <td>
__pkg.runtime.foreach(this, (BUTTONS), function (b_index_1, b) {
var once_3 = 1;
while (once_3) {
__m[__n++]=__ts[18];                              // 
                                                  //         <div class="cuecard-controlPane-powerTool">
var onclick_cb_1 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_1] = function (event) {
controlPane[b.command]()}
__m[__n++]=__ts[19];                              // 
                                                  //           <input class="button" type="submit" value="
__m[__n++]=__pkg.runtime.make_attr_safe(b.label);
__m[__n++]=__ts[20];                              // " onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_1);
__m[__n++]=__ts[21];                              // .apply(this, [event])">
                                                  //           <div class="cuecard-controlPane-powerTool-hint">
__m[__n++]=b.hint;
__m[__n++]=__ts[22];                              // </div>
                                                  //         </div>
once_3--;
} /* while once */
return once_3 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[23];                              // 
                                                  //       </td>
                                                  //       <td width="40%">
                                                  //         Results of tools<br>
                                                  //         <input checked="true" name="tools-result" type="radio" value="replace"> replace query (undo-able)<br>
                                                  //         <input name="tools-result" type="radio" value="output"> go into output pane
                                                  //       </td>
                                                  //     </tr></table>
                                                  //   </div>
return __m;
};
tools = __pkg.runtime.tfunc_factory("tools(controlPane)", tools, __pkg, undefined, false);
exports.tools = tools;
tools.source_microdata = null;
__m[__n++]=__ts[24];                              // 
// mjt.def=variables(controlPane)
var variables = function (controlPane) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[25];                              // 
                                                  //   <table class="cuecard-controlPane-variables">
                                                  //     <tr>
                                                  //       <th width="30%">name</th>
                                                  //       <th width="50%">value</th>
                                                  //       <th></th>
                                                  //     </tr>
// mjt.def=add_row()
var add_row = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[26];                              // <tr class="cuecard-controlPane-variables-row"
if (this.subst_id) { __m[__n++]=__pkg.runtime.bless(' id="' + this.subst_id + '"'); }
__m[__n++]=__ts[27];                              // >
                                                  //       <td><input></td>
                                                  //       <td><input></td>
                                                  //       <td>
var onclick_cb_2 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_2] = function (event) {
$(this).closest('.cuecard-controlPane-variables-row').remove()}
__m[__n++]=__ts[28];                              // 
                                                  //         <input class="button" type="submit" value="Remove" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_2);
__m[__n++]=__ts[29];                              // .apply(this, [event])">
                                                  //       </td>
                                                  //     </tr>
return __m;
};
add_row = __pkg.runtime.tfunc_factory("add_row()", add_row, __pkg, undefined, false);
add_row.source_microdata = null;
__m[__n++]=__ts[30];                              // 
                                                  //     
__m[__n++]=(add_row());
__m[__n++]=__ts[31];                              // 
                                                  //   </table>
                                                  //   <div>
var onclick_cb_3 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_3] = function (event) {
controlPane._getTab('variables').find('.cuecard-controlPane-variables').append($.acre(add_row()))}
__m[__n++]=__ts[32];                              // 
                                                  //     <input class="button" type="submit" value="Add" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_3);
__m[__n++]=__ts[33];                              // .apply(this, [event])">
                                                  //   </div>
return __m;
};
variables = __pkg.runtime.tfunc_factory("variables(controlPane)", variables, __pkg, undefined, false);
exports.variables = variables;
variables.source_microdata = null;
__m[__n++]=__ts[34];                              // 
// mjt.def=envelope(controlPane)
var envelope = function (controlPane) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[35];                              // 

    var ENV = [
      {name: 'extended', hint: 'Enable MQL extensions'},
      {name: 'as_of_time', hint: 'Resolve the query based on data in Freebase as of the given time in ISO8601 format, e.g., 2009-02-28, 2009-03-13T22:16:40'},
      {name: 'use_permission_of', hint: 'Specify the id of an object (typically a user, domain or type) whose permission you want to copy (<a href="http://freebaseapps.com/docs/mql/ch06.html#id2972357" target="_blank">more details</a>).'},
      {name: 'page', hint: 'Page number starting from 1 if there is a "limit" property in the top level query node.'},
      {name: 'cursor', hint: ''},
      {name: 'lang', hint: 'Return text values in the given language (specified with the language\'s Freebase ID)'},
      {name: 'escape', hint: ''},
      {name: 'uniqueness_failure', hint: ''}
    ];
    
    var def = controlPane._getDefaults();
  
__m[__n++]=__ts[36];                              // 
                                                  //   
                                                  //   <div class="cuecard-controlPane-explanation">
                                                  //     The query envelope contains directives to the query engine, specifying how to execute the query or how to return the results.
                                                  //   </div>
                                                  //   <table class="cuecard-controlPane-configurations">
__pkg.runtime.foreach(this, (ENV), function (e_index_1, e) {
var once_4 = 1;
while (once_4) {
__m[__n++]=__ts[37];                              // 
                                                  //     <tr>
                                                  //       <td>
__m[__n++]=e.name;
__m[__n++]=__ts[38];                              // </td>
                                                  //       <td>
switch (e.name) {
case "extended":
__m[__n++]=__ts[39];                              // <input
var dattrs_1 = (def.extended ? {'checked':''} : {});
var sattrs_1 = {};
if (!("name" in dattrs_1)) {__m[__n++]=__ts[40];                              //  name="extended"
 }
if (!("type" in dattrs_1)) {__m[__n++]=__ts[41];                              //  type="checkbox"
 }
for (var di_1 in dattrs_1) {
__m[__n++]=' ' + di_1;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_1[di_1]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[42];                              // >
break;
case "as_of_time":
__m[__n++]=__ts[43];                              // <input name="as_of_time" value="
__m[__n++]=__pkg.runtime.make_attr_safe(def.as_of_time||'');
__m[__n++]=__ts[44];                              // ">
break;
case "use_permission_of":
__m[__n++]=__ts[45];                              // <input name="use_permission_of" value="
__m[__n++]=__pkg.runtime.make_attr_safe(def.use_permission_of||'');
__m[__n++]=__ts[46];                              // ">
break;
case "page":
__m[__n++]=__ts[47];                              // <div class="cuecard-controlPane-configurations-page">
                                                  //             <input name="page" type="text">
var onclick_cb_4 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_4] = function (event) {
controlPane._runPage(-1)}
__m[__n++]=__ts[48];                              // 
                                                  //             <input class="button" type="submit" value="Previous" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_4);
__m[__n++]=__ts[49];                              // .apply(this, [event])">
var onclick_cb_5 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_5] = function (event) {
controlPane._runPage(1)}
__m[__n++]=__ts[50];                              // 
                                                  //             <input class="button" type="submit" value="Next" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_5);
__m[__n++]=__ts[51];                              // .apply(this, [event])">
                                                  //           </div>
break;
case "cursor":
__m[__n++]=__ts[52];                              // 
                                                  //             <div>
                                                  //               <input checked="" name="cursor-opt" type="radio" value="">
                                                  //               unspecified (return all results, possibly time-out)
                                                  //             </div>
                                                  //             <div>
                                                  //               <input name="cursor-opt" type="radio" value="true">
                                                  //               true (start pagination with page size equal "limit" option in query)
                                                  //             </div>
                                                  //             <div>
                                                  //               <input name="cursor-opt" type="radio" value="custom">
                                                  //               continue from cursor: 
                                                  //               <div class="cuecard-controlPane-configurations-cursor">
var onchange_cb_1 = __pkg.runtime.uniqueid("onchange");
mjt._eventcb[onchange_cb_1] = function (event) {
controlPane._getTab('envelope').find('input[name=\'cursor\'][value=\'custom\']').attr('checked','checked')}
__m[__n++]=__ts[53];                              // 
                                                  //                 <input name="cursor" type="text" onchange="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onchange_cb_1);
__m[__n++]=__ts[54];                              // .apply(this, [event])">
var onclick_cb_6 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_6] = function (event) {
controlPane._runCursor(false)}
__m[__n++]=__ts[55];                              // 
                                                  //                 <input class="button" type="submit" value="Paste from Last Result" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_6);
__m[__n++]=__ts[56];                              // .apply(this, [event])"> 
var onclick_cb_7 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_7] = function (event) {
controlPane._runCursor(true)}
__m[__n++]=__ts[57];                              // 
                                                  //                 <input class="button" type="submit" value="Paste &amp; Run" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_7);
__m[__n++]=__ts[58];                              // .apply(this, [event])">
                                                  //               </div>
                                                  //             </div>
break;
case "lang":
__m[__n++]=__ts[59];                              // <select class="cuecard-controlPane-configurations-languages">
                                                  //             <option value="">--</option>
__pkg.runtime.foreach(this, (CueCard.Languages), function (l_index_1, l) {
var once_5 = 1;
while (once_5) {
__m[__n++]=__ts[60];                              // 
                                                  //             <option value="
__m[__n++]=__pkg.runtime.make_attr_safe(l.id);
__m[__n++]=__ts[61];                              // ">
__m[__n++]=l.name;
__m[__n++]=__ts[62];                              //  (
__m[__n++]=l.id;
__m[__n++]=__ts[63];                              // )</option>
once_5--;
} /* while once */
return once_5 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[64];                              // 
                                                  //           </select>
break;
case "escape":
__m[__n++]=__ts[65];                              // <select>
                                                  //             <option value="">--</option>
                                                  //             <option value="html">html</option>
                                                  //             <option value="false">false</option>
                                                  //           </select>
break;
case "uniqueness_failure":
__m[__n++]=__ts[66];                              // <select>
                                                  //             <option value="">--</option>
                                                  //             <option value="soft">soft</option>
                                                  //           </select>
break;
};
__m[__n++]=__ts[67];                              // 
if (e.hint.length > 0) {
__m[__n++]=__ts[68];                              // 
                                                  //         <div class="cuecard-controlPane-hint">
__m[__n++]=(mjt.bless(e.hint));
__m[__n++]=__ts[69];                              // </div>
}
__m[__n++]=__ts[70];                              // 
                                                  //       </td>
                                                  //     </tr>
once_4--;
} /* while once */
return once_4 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[71];                              // 
                                                  //   </table>
return __m;
};
envelope = __pkg.runtime.tfunc_factory("envelope(controlPane)", envelope, __pkg, undefined, false);
exports.envelope = envelope;
envelope.source_microdata = null;
__m[__n++]=__ts[72];                              // 
// mjt.def=custom_envelope(controlPane)
var custom_envelope = function (controlPane) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[73];                              // 

    var env = "env" in controlPane._options ? controlPane._options.env : {};
    var has_env = false;
  
__m[__n++]=__ts[74];                              // 
                                                  //   
                                                  //   <table class="cuecard-controlPane-customEnvelope">
                                                  //     <tr>
                                                  //       <th width="30%">name</th>
                                                  //       <th width="50%">value</th>
                                                  //       <th></th>
                                                  //     </tr>
// mjt.def=add_row(dontFocus, name, value)
var add_row = function (dontFocus, name, value) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[75];                              // <tr class="cuecard-controlPane-customEnvelope-row"
if (this.subst_id) { __m[__n++]=__pkg.runtime.bless(' id="' + this.subst_id + '"'); }
__m[__n++]=__ts[76];                              // >
                                                  //       <td><input value="
__m[__n++]=__pkg.runtime.make_attr_safe(name||'');
__m[__n++]=__ts[77];                              // "></td>
                                                  //       <td><input value="
__m[__n++]=__pkg.runtime.make_attr_safe(value||'');
__m[__n++]=__ts[78];                              // "></td>
                                                  //       <td>
var onclick_cb_8 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_8] = function (event) {
$(this).closest('.cuecard-controlPane-customEnvelope-row').remove()}
__m[__n++]=__ts[79];                              // 
                                                  //         <input class="button" type="submit" value="Remove" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_8);
__m[__n++]=__ts[80];                              // .apply(this, [event])">
                                                  //       </td>
if (!dontFocus) {
__pkg.runtime.ondomready(function () {

        
      
}, this);
}
__m[__n++]=__ts[81];                              // 
                                                  //     </tr>
return __m;
};
add_row = __pkg.runtime.tfunc_factory("add_row(dontFocus, name, value)", add_row, __pkg, undefined, false);
add_row.source_microdata = null;
__m[__n++]=__ts[82];                              // 
__pkg.runtime.foreach(this, (env), function (key, value) {
var once_6 = 1;
while (once_6) {
__m[__n++]=__ts[83];                              // 
has_env = true;
__m[__n++]=__ts[84];                              // 
                                                  //       
__m[__n++]=(add_row(true, key, JSON.stringify(value)));
__m[__n++]=__ts[85];                              // 
once_6--;
} /* while once */
return once_6 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[86];                              // 
if (!has_env) {
__m[__n++]=__ts[87];                              // 
                                                  //       
__m[__n++]=(add_row(true));
__m[__n++]=__ts[88];                              // 
}
__m[__n++]=__ts[89];                              // 
                                                  //   </table>
                                                  //   <div>
var onclick_cb_9 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_9] = function (event) {
controlPane._getTab('customEnvelope').find('.cuecard-controlPane-customEnvelope').append($.acre(add_row()))}
__m[__n++]=__ts[90];                              // 
                                                  //     <input class="button" type="submit" value="Add" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_9);
__m[__n++]=__ts[91];                              // .apply(this, [event])">
                                                  //   </div>
return __m;
};
custom_envelope = __pkg.runtime.tfunc_factory("custom_envelope(controlPane)", custom_envelope, __pkg, undefined, false);
exports.custom_envelope = custom_envelope;
custom_envelope.source_microdata = null;
__m[__n++]=__ts[92];                              // 
// mjt.def=settings(controlPane)
var settings = function (controlPane) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[93];                              // 
                                                  //   <div>
                                                  //     <input
var dattrs_2 = (($.cookie('cc_cp_clean') == '1') ? {'checked' : ''} : {});
var sattrs_2 = {};
if (!("type" in dattrs_2)) {__m[__n++]=__ts[94];                              //  type="checkbox"
 }
for (var di_2 in dattrs_2) {
__m[__n++]=' ' + di_2;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_2[di_2]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[95];                              // >
                                                  //     Always clean up query before running
                                                  //   </div>
                                                  //   <div>
                                                  //     <input
var dattrs_3 = (($.cookie('cc_cp_align') == '1') ? {'checked' : ''} : {});
var sattrs_3 = {};
if (!("type" in dattrs_3)) {__m[__n++]=__ts[96];                              //  type="checkbox"
 }
for (var di_3 in dattrs_3) {
__m[__n++]=' ' + di_3;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_3[di_3]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[97];                              // >
                                                  //     Align JSON property values with spaces
                                                  //   </div>
                                                  //   <div style="display: none;">
                                                  //     <input type="checkbox">
                                                  //     Try running query as you edit
                                                  //   </div>
                                                  //   <div>
                                                  //     <input
var dattrs_4 = (($.cookie('cc_cp_multi') == '1') ? {'checked' : ''} : {});
var sattrs_4 = {};
if (!("type" in dattrs_4)) {__m[__n++]=__ts[98];                              //  type="checkbox"
 }
for (var di_4 in dattrs_4) {
__m[__n++]=' ' + di_4;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_4[di_4]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[99];                              // >
                                                  //     Show error messages with multiple lines on multiple lines
                                                  //   </div>
return __m;
};
settings = __pkg.runtime.tfunc_factory("settings(controlPane)", settings, __pkg, undefined, false);
exports.settings = settings;
settings.source_microdata = null;
__m[__n++]=__ts[100];                             // 
return __m;
};
rawmain.source_microdata = null;
; return rawmain;})(),
info:{"file":"//62b.cuecard.site.tags.svn.freebase-site.googlecode.dev/control-pane","stringtable":["","","\n\n  <div class=\"cuecard-controlPane section-tabs\">\n    <div id=\"","\">\n      <ul class=\"section-tabset clear\">","\n        <li class=\"section-tab tab\">\n          <a href=\"#","-","\"><span>","</span></a>\n        </li>","\n      </ul>\n      <div class=\"tabbed-content\">","\n        <div class=\"cuecard-controlPane-tabBody\" id=\"","-","\">\n          ","\n        </div>","\n      </div>\n    </div>\n  </div>","","","","\n\n  <div class=\"cuecard-controlPane-section\">\n    <table><tr valign=\"top\">\n      <td>","\n        <div class=\"cuecard-controlPane-powerTool\">","\n          <input class=\"button\" type=\"submit\" value=\"","\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n          <div class=\"cuecard-controlPane-powerTool-hint\">","</div>\n        </div>","\n      </td>\n      <td width=\"40%\">\n        Results of tools<br>\n        <input checked=\"true\" name=\"tools-result\" type=\"radio\" value=\"replace\"> replace query (undo-able)<br>\n        <input name=\"tools-result\" type=\"radio\" value=\"output\"> go into output pane\n      </td>\n    </tr></table>\n  </div>","","\n  <table class=\"cuecard-controlPane-variables\">\n    <tr>\n      <th width=\"30%\">name</th>\n      <th width=\"50%\">value</th>\n      <th></th>\n    </tr>","<tr class=\"cuecard-controlPane-variables-row\"",">\n      <td><input></td>\n      <td><input></td>\n      <td>","\n        <input class=\"button\" type=\"submit\" value=\"Remove\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n      </td>\n    </tr>","\n    ","\n  </table>\n  <div>","\n    <input class=\"button\" type=\"submit\" value=\"Add\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n  </div>","","","\n  \n  <div class=\"cuecard-controlPane-explanation\">\n    The query envelope contains directives to the query engine, specifying how to execute the query or how to return the results.\n  </div>\n  <table class=\"cuecard-controlPane-configurations\">","\n    <tr>\n      <td>","</td>\n      <td>","<input"," name=\"extended\""," type=\"checkbox\"",">","<input name=\"as_of_time\" value=\"","\">","<input name=\"use_permission_of\" value=\"","\">","<div class=\"cuecard-controlPane-configurations-page\">\n            <input name=\"page\" type=\"text\">","\n            <input class=\"button\" type=\"submit\" value=\"Previous\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">","\n            <input class=\"button\" type=\"submit\" value=\"Next\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n          </div>","\n            <div>\n              <input checked=\"\" name=\"cursor-opt\" type=\"radio\" value=\"\">\n              unspecified (return all results, possibly time-out)\n            </div>\n            <div>\n              <input name=\"cursor-opt\" type=\"radio\" value=\"true\">\n              true (start pagination with page size equal \"limit\" option in query)\n            </div>\n            <div>\n              <input name=\"cursor-opt\" type=\"radio\" value=\"custom\">\n              continue from cursor: \n              <div class=\"cuecard-controlPane-configurations-cursor\">","\n                <input name=\"cursor\" type=\"text\" onchange=\"return mjt._eventcb.",".apply(this, [event])\">","\n                <input class=\"button\" type=\"submit\" value=\"Paste from Last Result\" onclick=\"return mjt._eventcb.",".apply(this, [event])\"> ","\n                <input class=\"button\" type=\"submit\" value=\"Paste &amp; Run\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n              </div>\n            </div>","<select class=\"cuecard-controlPane-configurations-languages\">\n            <option value=\"\">--</option>","\n            <option value=\"","\">"," (",")</option>","\n          </select>","<select>\n            <option value=\"\">--</option>\n            <option value=\"html\">html</option>\n            <option value=\"false\">false</option>\n          </select>","<select>\n            <option value=\"\">--</option>\n            <option value=\"soft\">soft</option>\n          </select>","","\n        <div class=\"cuecard-controlPane-hint\">","</div>","\n      </td>\n    </tr>","\n  </table>","","","\n  \n  <table class=\"cuecard-controlPane-customEnvelope\">\n    <tr>\n      <th width=\"30%\">name</th>\n      <th width=\"50%\">value</th>\n      <th></th>\n    </tr>","<tr class=\"cuecard-controlPane-customEnvelope-row\"",">\n      <td><input value=\"","\"></td>\n      <td><input value=\"","\"></td>\n      <td>","\n        <input class=\"button\" type=\"submit\" value=\"Remove\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n      </td>","\n    </tr>","","","\n      ","","","\n      ","","\n  </table>\n  <div>","\n    <input class=\"button\" type=\"submit\" value=\"Add\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n  </div>","","\n  <div>\n    <input"," type=\"checkbox\"",">\n    Always clean up query before running\n  </div>\n  <div>\n    <input"," type=\"checkbox\"",">\n    Align JSON property values with spaces\n  </div>\n  <div style=\"display: none;\">\n    <input type=\"checkbox\">\n    Try running query as you edit\n  </div>\n  <div>\n    <input"," type=\"checkbox\"",">\n    Show error messages with multiple lines on multiple lines\n  </div>",""],"debug_locs":[1,1,1,1,1,1,7,7,7,7,9,9,10,11,12,13,14,15,16,17,20,20,20,20,20,22,22,22,22,22,23,23,23,23,23,23,23,23,24,24,24,24,24,24,27,27,27,27,27,27,27,27,27,27,27,28,28,28,29,29,29,29,29,29,34,34,34,34,34,34,35,36,37,38,39,40,41,42,44,44,44,44,44,44,46,46,46,46,48,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,76,76,76,76,76,76,76,76,77,77,77,77,77,77,77,77,77,77,78,78,78,79,79,79,79,79,79,89,89,89,89,89,89,89,89,89,89,89,89,89,89,92,92,92,92,99,99,99,99,99,99,99,99,99,99,99,99,104,104,104,104,104,104,104,104,104,104,106,106,106,106,106,106,106,107,107,107,111,111,111,111,111,111,111,111,111,113,113,113,113,113,113,113,116,116,116,116,118,118,119,120,121,122,123,124,125,126,127,128,129,130,131,137,137,137,137,137,137,137,137,137,138,138,138,138,140,140,140,140,142,142,142,142,142,142,142,142,142,142,142,142,142,142,142,142,144,144,144,144,144,146,146,146,146,146,150,150,150,150,150,150,150,150,151,151,151,151,151,151,151,152,152,152,152,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,168,168,168,168,168,168,168,169,169,169,169,169,169,169,172,172,172,172,172,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,177,177,177,177,183,183,183,183,183,183,183,188,188,188,188,188,188,191,191,191,191,191,191,191,193,193,193,193,193,193,193,196,196,196,196,196,196,196,199,199,199,199,200,200,201,202,203,211,211,211,211,211,211,211,211,211,211,211,211,211,212,212,212,213,213,213,216,216,216,216,216,216,216,216,218,218,218,218,218,219,220,221,221,222,222,222,222,222,222,222,222,222,222,223,223,225,225,225,226,226,226,226,226,226,226,227,227,227,228,228,232,232,232,232,232,232,232,232,232,234,234,234,234,234,234,234,237,237,237,237,239,239,239,239,239,239,239,239,239,239,239,239,239,243,243,243,243,243,243,243,243,243,243,243,243,243,243,243,251,251,251,251,251,251,251,251,251,251,251,251,251,251,251,251,251,251,251,254,254,254,254,254,254,254,254,255,255,255,255],"output_mode":"html"}}
});
}

/** output-pane **/
if (jQuery) {
jQuery(window).trigger('acre.template.register', {pkgid: '//62b.cuecard.site.tags.svn.freebase-site.googlecode.dev/output-pane', source: {def: (function () {// mjt.def=rawmain()
var rawmain = function () {
var __pkg = this.tpackage;
var exports = this.exports;
var __ts=__pkg._template_fragments;
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[0];                               // 
// mjt.def=tabs(id, outputPane)
var tabs = function (id, outputPane) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[1];                               // 

    var TABS = [
      { name: 'Tree', key: "tree"},
      { name: 'Text', key: "text"}, 
      { name: 'Status', key: "status"}
    ];
  
__m[__n++]=__ts[2];                               // 
                                                  //   
                                                  //   <div class="cuecard-outputPane section-tabs">
                                                  //     <div id="
__m[__n++]=__pkg.runtime.make_attr_safe(id);
__m[__n++]=__ts[3];                               // ">
                                                  //       <ul class="section-tabset clear">
__pkg.runtime.foreach(this, (TABS), function (index, tab) {
var once_1 = 1;
while (once_1) {
__m[__n++]=__ts[4];                               // 
                                                  //         <li class="section-tab tab">
                                                  //           <a href="#
__m[__n++]=__pkg.runtime.make_attr_safe(id);
__m[__n++]=__ts[5];                               // -
__m[__n++]=__pkg.runtime.make_attr_safe(tab.key);
__m[__n++]=__ts[6];                               // "><span>
__m[__n++]=tab.name;
__m[__n++]=__ts[7];                               // </span></a>
                                                  //         </li>
once_1--;
} /* while once */
return once_1 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[8];                               // 
                                                  //       </ul>
                                                  //       <div class="tabbed-content">
__pkg.runtime.foreach(this, (TABS), function (tab_index_1, tab) {
var once_2 = 1;
while (once_2) {
__m[__n++]=__ts[9];                               // 
                                                  //         <div class="cuecard-outputPane-tabBody" id="
__m[__n++]=__pkg.runtime.make_attr_safe(id);
__m[__n++]=__ts[10];                              // -
__m[__n++]=__pkg.runtime.make_attr_safe(tab.key);
__m[__n++]=__ts[11];                              // ">
switch (tab.key) {
case "tree":
__m[__n++]=__ts[12];                              // <div class="cuecard-outputPane-tree"></div>
break;
case "text":
__m[__n++]=__ts[13];                              // <textarea class="cuecard-outputPane-textarea" readonly="true" wrap="off"></textarea>
break;
case "status":
__m[__n++]=__ts[14];                              // <div class="cuecard-outputPane-status"></div>
break;
};
__m[__n++]=__ts[15];                              // 
                                                  //         </div>
once_2--;
} /* while once */
return once_2 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[16];                              // 
                                                  //       </div>
                                                  //     </div>
                                                  //   </div>
__pkg.runtime.ondomready(function () {

    outputPane.layout = function(){
      var el = this._elmt;
      var fullHeight = el.innerHeight() - el.find('.section-tab').outerHeight() - (outputPane._options.verticalPadding || 12);
      var fullWidth = el.find('.section-tabs').innerWidth() - (outputPane._options.horizontalPadding || 0);

      var padding = 10;
      var height = fullHeight - (2 * padding);
      var width = fullWidth - (2 * padding);

      el.find('.cuecard-outputPane-tabBody, .cuecard-outputPane-textarea').height(fullHeight).width(fullWidth);
      el.find('.cuecard-outputPane-status, .cuecard-outputPane-tree').css("padding", padding).height(height).width(width);
    }
    outputPane.layout();
  
}, this);
__m[__n++]=__ts[17];                              // 
return __m;
};
tabs = __pkg.runtime.tfunc_factory("tabs(id, outputPane)", tabs, __pkg, undefined, false);
exports.tabs = tabs;
tabs.source_microdata = null;
__m[__n++]=__ts[18];                              // 
// mjt.def=status(headers)
var status = function (headers) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[19];                              // 
                                                  //   <div class="cuecard-outputPane-responseHeaders">
if (headers['x-metaweb-tid']) {
__m[__n++]=__ts[20];                              // 
var tid = headers["x-metaweb-tid"];
__m[__n++]=__ts[21];                              // 
                                                  //       <h3>x-metaweb-tid (transaction ID)</h3>
                                                  //       <div>
                                                  //         <a href="http://stats.metaweb.com/query/transaction?tid=
__m[__n++]=__pkg.runtime.make_attr_safe(encodeURIComponent(tid));
__m[__n++]=__ts[22];                              // " target="_blank">
                                                  //           
__m[__n++]=tid;
__m[__n++]=__ts[23];                              // 
                                                  //         </a>
                                                  //       </div>
}
__m[__n++]=__ts[24];                              // 
if (headers['x-metaweb-cost']) {
__m[__n++]=__ts[25];                              // 

        var xmc = headers["x-metaweb-cost"].split(",");
        var odd = true;
      
__m[__n++]=__ts[26];                              // 
                                                  //       <h3>x-metaweb-cost header components</h3>
                                                  //       <table>
                                                  //         <tr><th>code</th><th>value</th><th>meaning</th><th>subsystem</th></tr>
__pkg.runtime.foreach(this, (xmc), function (index, entry) {
var once_3 = 1;
while (once_3) {
__m[__n++]=__ts[27];                              // 

            var pair = entry.split("=");
            pair[0] = pair[0].replace(/^\s+/, '').replace(/\s+$/, '');
            var cost = CueCard.XMetawebCosts[pair[0]];
            var rclass = (index % 2 ? "cuecard-outputPane-odd" : "cuecard-outputPane-even") + ((cost !== undefined && "important" in cost && cost.important) ? " cuecard-outputPane-cost-important" : "")
          
__m[__n++]=__ts[28];                              // 
                                                  //           <tr class="
__m[__n++]=__pkg.runtime.make_attr_safe(rclass);
__m[__n++]=__ts[29];                              // ">
                                                  //             <td>
__m[__n++]=(pair[0]);
__m[__n++]=__ts[30];                              // </td>
                                                  //             <td>
__m[__n++]=(pair[1]);
__m[__n++]=__ts[31];                              // </td>
if (cost !== undefined) {
__m[__n++]=__ts[32];                              // 
                                                  //             <td>
__m[__n++]=cost.meaning;
__m[__n++]=__ts[33];                              // </td>
}
else {
__m[__n++]=__ts[34];                              // <td>--</td>
}
__m[__n++]=__ts[35];                              // 
if (cost !== undefined) {
__m[__n++]=__ts[36];                              // 
                                                  //             <td>
__m[__n++]=cost.subsystem;
__m[__n++]=__ts[37];                              // </td>
}
else {
__m[__n++]=__ts[38];                              // <td>--</td>
}
__m[__n++]=__ts[39];                              // 
                                                  //           </tr>
once_3--;
} /* while once */
return once_3 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[40];                              // 
                                                  //       </table>
}
__m[__n++]=__ts[41];                              // 
                                                  // 
                                                  //     <h3>response headers</h3>
                                                  //     <table>
var odd = true;
__m[__n++]=__ts[42];                              // 
__pkg.runtime.foreach(this, (headers), function (key, value) {
var once_4 = 1;
while (once_4) {
if (key != 'x-metaweb-cost' && key != 'x-metaweb-tid') {
__m[__n++]=__ts[43];                              // 
                                                  //         <tr
var dattrs_1 = (odd ? {'class': 'cuecard-outputPane-odd'} : {'class': 'cuecard-outputPane-even'});
var sattrs_1 = {};
for (var di_1 in dattrs_1) {
__m[__n++]=' ' + di_1;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_1[di_1]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[44];                              // >
                                                  //           <td>
__m[__n++]=key;
__m[__n++]=__ts[45];                              // </td>
                                                  //           <td>
__m[__n++]=value;
__m[__n++]=__ts[46];                              // </td>
                                                  //         </tr>
odd = !odd
__m[__n++]=__ts[47];                              // 
}
once_4--;
} /* while once */
return once_4 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[48];                              // 
                                                  //     </table>
                                                  // 
                                                  //   </div>
return __m;
};
status = __pkg.runtime.tfunc_factory("status(headers)", status, __pkg, undefined, false);
exports.status = status;
status.source_microdata = null;
__m[__n++]=__ts[49];                              // 
return __m;
};
rawmain.source_microdata = null;
; return rawmain;})(),
info:{"file":"//62b.cuecard.site.tags.svn.freebase-site.googlecode.dev/output-pane","stringtable":["","","\n  \n  <div class=\"cuecard-outputPane section-tabs\">\n    <div id=\"","\">\n      <ul class=\"section-tabset clear\">","\n        <li class=\"section-tab tab\">\n          <a href=\"#","-","\"><span>","</span></a>\n        </li>","\n      </ul>\n      <div class=\"tabbed-content\">","\n        <div class=\"cuecard-outputPane-tabBody\" id=\"","-","\">","<div class=\"cuecard-outputPane-tree\"></div>","<textarea class=\"cuecard-outputPane-textarea\" readonly=\"true\" wrap=\"off\"></textarea>","<div class=\"cuecard-outputPane-status\"></div>","\n        </div>","\n      </div>\n    </div>\n  </div>","","","\n  <div class=\"cuecard-outputPane-responseHeaders\">","","\n      <h3>x-metaweb-tid (transaction ID)</h3>\n      <div>\n        <a href=\"http://stats.metaweb.com/query/transaction?tid=","\" target=\"_blank\">\n          ","\n        </a>\n      </div>","","","\n      <h3>x-metaweb-cost header components</h3>\n      <table>\n        <tr><th>code</th><th>value</th><th>meaning</th><th>subsystem</th></tr>","","\n          <tr class=\"","\">\n            <td>","</td>\n            <td>","</td>","\n            <td>","</td>","<td>--</td>","","\n            <td>","</td>","<td>--</td>","\n          </tr>","\n      </table>","\n\n    <h3>response headers</h3>\n    <table>","","\n        <tr",">\n          <td>","</td>\n          <td>","</td>\n        </tr>","","\n    </table>\n\n  </div>",""],"debug_locs":[1,1,1,1,1,1,6,6,6,6,8,8,9,10,11,12,13,14,17,17,17,17,17,19,19,19,19,19,20,20,20,20,20,20,20,20,21,21,21,21,21,21,24,24,24,24,24,24,24,24,24,24,24,25,25,25,26,26,26,27,27,27,28,28,28,29,29,29,29,29,29,35,35,35,35,35,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,52,52,52,52,52,52,54,54,54,54,57,57,57,58,58,61,61,61,61,61,62,62,62,65,65,65,65,67,67,68,68,69,70,71,75,75,75,75,75,75,75,76,76,77,78,79,80,81,82,82,82,83,83,83,84,84,84,85,85,85,85,85,85,85,85,85,85,86,86,86,86,86,86,86,86,86,86,88,88,88,88,88,88,90,90,90,94,94,94,94,94,95,95,95,95,95,96,96,96,96,96,96,96,96,96,96,97,97,97,98,98,98,100,100,100,102,102,102,102,102,102,106,106,106,106,106,106,106,106,106,107,107,107,107],"output_mode":"html"}}
});
}
