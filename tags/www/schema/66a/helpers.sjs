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
var h = acre.require("lib/helper/helpers.sjs");
var validators = acre.require("lib/validator/validators.sjs");
var i18n = acre.require("lib/i18n/i18n.sjs");
var apis = acre.require("lib/promise/apis");
var freebase = apis.freebase;
var deferred = apis.deferred;
var typeloader = acre.require("lib/schema/typeloader.sjs");

function isTypeType(id) {
  return id.indexOf('/type/') == 0;
}

function isGlobal(id) {
  return id.indexOf('/user/') == -1 &&
         id.indexOf('/guid/') == -1 &&
         id.indexOf('/base/') == -1;
}

function sort_by_id(a,b) {
  return b.id < a.id;
};

/***
 * If you change schema key validation logic please update:
 *
 * lib/validator/validators.sjs
 * schema/helpers.sjs
 * lib/propbox/jquery.mqlkey.js
 */

function generate_key(name) {
  var key = h.trim(name).toLowerCase();
  key = key.replace(/[^a-z0-9]/g, '_');    // remove all non-alphanumeric
  key = key.replace(/\_\_+/g, '_');        // replace __+ with _
  key = key.replace(/[^a-z0-9]+$/, '');    // strip ending non-alphanumeric
  key = key.replace(/^[^a-z]+/, '');       // strip beginning non-alpha
  if (validators.reserved_word(key)) {
    key = "x_" + key;
  }
  return key;
};

function generate_domain_key(name) {
  return generate_key(name);
};

function generate_type_key(name) {
  return generate_key(name);
};

function generate_property_key(name) {
  return generate_key(name);
};


/**
 * When user Shift+Reload a domain, type or property schema page,
 * we want to flush or invalidate our schema cache of the type(s)
 * associated with the domain, type or property.
 * For domain, we want to invalidate all types (and their properties)
 * in that domain.
 * For type, we want to invalidate the type (and its properties).
 * For property, we are essentially invalidating its type
 * (and its sibling properties).
 * @param {string} id The domain, type or property id.
 * @return {lib.promise.deferred.Deferred} A promise that resolves to
 *   TRUE if we invalidated, otherwise FALSE.
 * @see lib.schema.typeloader.invalidate
 */
function invalidate_schema_cache_maybe(id) {
  if (acre.request.headers['cache-control'] &&
      acre.request.headers['cache-control'].indexOf('no-cache') !== -1) {
    // what is id?
    var q = {
      id: id,
      type: {
        'id|=': ['/type/domain', '/type/type', '/type/property'],
        id: null,
        limit: 1
      },
      // for domain
      '/type/domain/types': [],
      // for property
      '/type/property/schema': null
    };
    return freebase.mqlread(q)
      .then(function(env) {
        var result = env.result;
        if (result.type.id === '/type/domain') {
          if (result['/type/domain/types'].length > 0) {
            typeloader.invalidate(result['/type/domain/types']);
            return true;
          }
        }
        else if (result.type.id === '/type/type') {
          typeloader.invalidate(id);
          return true;
        }
        else if (result.type.id === '/type/property') {
          if (result['/type/property/schema']) {
            typeloader.invalidate(result['/type/property/schema']);
            return true;
          }
        }
        return false;
      }, function(err) {
        return false;
      });
  }
  else {
    return deferred.resolved(false);
  }
};
