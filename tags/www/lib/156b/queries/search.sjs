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
var deferred = acre.require("promise/deferred");
var freebase = acre.require("promise/apis").freebase;

/**
 * These are the langs supported by search as of 2013-07-13.
 * @private
 */
var DEFAULT_LANGS_ =
    "en,es,fr,de,it,pt,zh,ja,ko,ru,sv,fi,da,nl,el,ro,tr,hu,th";

/**
 * Get the supported langs for freebase search from the memcache or
 * from freebase search
 * (e.g/, https://www.googleapis.com/freebase/v1/search?help=langs).
 * @return A Promise that resolved to a string of langs delimited by ','.
 */
function get_search_langs() {
  var langs = acre.cache.get('__SEARCH_LANGS__');
  if (langs) {
    return deferred.resolved(langs);
  }
  // freebase.search needs a non-empty query string so just use 'foo'.
  return freebase.search('foo', {'help': 'langs'})
      .then(function(data) {
        try {
          langs = data['result'][0]['output']['langs']['codes'][0];
        } catch (x) {
          return DEFAULT_LANGS_;
        }
        acre.cache.put('__SEARCH_LANGS__', langs);
        return langs;
      }, function(err) {
        return DEFAULT_LANGS_;
      });
};
