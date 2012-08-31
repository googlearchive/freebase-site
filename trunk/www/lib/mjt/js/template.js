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
