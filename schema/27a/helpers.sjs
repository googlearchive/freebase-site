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

var mf = acre.require("MANIFEST").mf;
var h = mf.require("core", "helpers");
var i18n = mf.require("i18n", "i18n");

function isTypeType(id) {
  return id.indexOf('/type/') == 0;
}

function isGlobal(id) {
  return id.indexOf('/user/') == -1 &&
         id.indexOf('/guid/') == -1 &&
         id.indexOf('/base/') == -1;
}

/*
    Returns a query string for provided property
*/
function build_query_url(type_id, prop_id) {
  var q = {
    id: null,
    name: null,
    type: type_id
  };
  q[prop_id || "*"] = [];
  q = [q];
  return h.freebase_url("/app/queryeditor", {autorun: true, q: JSON.stringify(q)});
};

function sort_by_id(a,b) {
  return b.id < a.id;
};

function generate_key(name) {
  var key = h.trim(name).toLowerCase();
  key = key.replace(/[^a-z0-9]/g, '_');    // remove all non-alphanumeric
  key = key.replace(/\_\_+/g, '_');        // replace __+ with _
  key = key.replace(/[^a-z0-9]+$/, '');    // strip ending non-alphanumeric
  key = key.replace(/^[^a-z]+/, '');       // strip beginning non-alpha
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
