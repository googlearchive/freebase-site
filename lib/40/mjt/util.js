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

