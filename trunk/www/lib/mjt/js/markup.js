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
