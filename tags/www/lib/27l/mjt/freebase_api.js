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

