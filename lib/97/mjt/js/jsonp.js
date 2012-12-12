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
