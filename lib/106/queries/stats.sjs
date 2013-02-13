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

var h = acre.require('helper/helpers.sjs');
var apis = acre.require("promise/apis");
var freebase = apis.freebase;

var DEFAULT_TIMEOUT = 2000;

/**
 * Get statistics for specified type
 * @param  {!string} type_id Id of a type
 * @return {lib.promise.deferred.Deferred} A promise for Stats API call
 */
function get_type_stats(type_id) {
  var path = type_id;
  var options = {
    http_timeout: DEFAULT_TIMEOUT
  };
  var empty_type_stats = {
    triples: 0,
    nodes: 0,
    triples_by_day: {}
  };
  return freebase.get_statistics(path, options)
    .then(function(result) {
      return result && result.type || empty_type_stats;
    },function(e){
      return empty_type_stats;
    });
}

/**
 * Get statistics for specified domain
 * @param  {!string} domain_id Id of a domain
 * @return {lib.promise.deferred.Deferred} A promise for Stats API call
 */
function get_domain_stats(domain_id) {
  var path = domain_id;
  var options = {
    http_timeout: DEFAULT_TIMEOUT
  };
  var empty_domain_stats = {
    triples: 0,
    entities: 0,
    nodes: 0,
    triples_by_day: {},
    triples_by_type: {},
    nodes_by_type: {}
  };
  return freebase.get_statistics(path, options)
    .then(function(result) {
      return result && result.domain || empty_type_stats;
    },function(e){
      return empty_type_stats;
    });
}

/**
 * Returns promise for Stats API call to get total stats
 * @return {lib.promise.deferred.Deferred} A promise for Stats API call
 */
function get_total_stats() {
  var path = "/total";
  var options = {
    http_timeout: DEFAULT_TIMEOUT
  };
  var default_total_stats = {
    // return some default stats for the main page
    triples: 556113311,
    triples_7days: 9332844,
    entities: 37123321,
    nodes: 69235632,
    triples_by_domain: {},
    triples_7days_by_domain: {},
    entities_by_domain: {},
    nodes_by_domain: {}
  };
  return freebase.get_statistics(path, options)
    .then(function(result){
      return result && result.total || default_total_stats;
    }, function(e){
      return default_total_stats;
    });
}



