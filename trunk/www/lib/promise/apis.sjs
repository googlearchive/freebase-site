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

var deferred = acre.require("promise/deferred");
var urlfetch;
var freebase = {};
var hasCharacter = /\D/;

(function() {

  var _urlfetch = function() {
    // Wrap async urlfetch to handle redirects
    var internal_urlfetch = deferred.makePromise(
      acre.async.urlfetch,
      {position:1, key:"callback"},
      {position:1, key:"errback"}
    );

    var args = Array.prototype.slice.call(arguments);

    var handle_redirect_error = function(error) {
      // Not a urlfetch exception, so let someone else handle it
      if (!(error instanceof acre.errors.URLError)) {
        throw error;
      }

      // Not a redirect, let someone else handle it
      if (error.info.status < 300 || error.info.status > 399) {
        throw error;
      }

      // Invalid redirect so we can't redirect
      if (!error.info.headers['Location'] || !error.info.headers['Location'].length) {
        throw error;
      }

      // Lets try this again, this time with the new url
      args[0] = error.info.headers['Location'];
      return internal_urlfetch.apply(null, args);
    };

    var handle_timeout_error = function(error) {
      if (error.message === "Deadline must be > 0, got 0.0") {
        // same same for appengine
        error.message = "Time limit exceeded";
      }
      if (error.message === "Time limit exceeded") {
        throw new deferred.RequestTimeout(error.message);
      }
      return error;
    };

    return internal_urlfetch.apply(null, args)
      .then(null, handle_redirect_error)
      .then(null, handle_timeout_error);
  };
  urlfetch = _urlfetch;

  freebase.get_static = function(bdb, ids, options) {
    var retrieve_ids;

    if (!(ids instanceof Array)) {
      retrieve_ids = [ids];
    } else {
      retrieve_ids = ids;
    }

    var url = acre.freebase.service_url;
    url += "/api/trans/"+bdb+"?";
    retrieve_ids.forEach(function(id, i) {
      url += (i ? "&" : "") +  "id="+ id;
    });

    return _urlfetch(url, options)
      .then(function(response) {
        response = JSON.parse(response.body);
        var results = {};
        retrieve_ids.forEach(function (id) {
          results[id] = response[id].result;
        });
        return results;
      })
      .then(function(results) {
        if (!(ids instanceof Array)) {
          return results[ids];
        } else {
          return results;
        }
      });
  };

  var freebase_apis = [
      {name: "fetch",            options_pos: 1},
      {name: "touch",            options_pos: 0},
      {name: "get_user_info",    options_pos: 0},
      {name: "mqlread",          options_pos: 2},
      {name: "mqlread_multiple", options_pos: 2},
      {name: "mqlwrite",         options_pos: 2},
      {name: "upload",           options_pos: 2},
      {name: "create_group",     options_pos: 1},
      {name: "get_blob",         options_pos: 2},
      {name: "get_topic",        options_pos: 1},
      {name: "get_topic_multi",  options_pos: 1},
      {name: "search",           options_pos: 1},
      {name: "geosearch",        options_pos: 1}
  ];

  freebase_apis.forEach(function(api){
      freebase[api.name] = deferred.makePromise(
          acre.freebase[api.name],
          {position:api["options_pos"], key:"callback"},
          {position:api["options_pos"], key:"errback"}
      );
  });
})();
