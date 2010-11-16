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

function random() {
  var r = [];
  for (var i=0; i<32; i++) {
    r[i] = random.CHARS[0 | Math.random() * 32];
  };
  return r.join("");
}
random.CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

/**
 * Create a minimal domain in user_id namespace.
 * Caller must be authenticated and have permission on user_id.
 * @param user_id:String (required) - the user id of the current authenticated user.
 * @param options:String (optional) - options to extend the create unconditional type clause.
 */
function create_domain(user_id, options) {
  var name = "test_domain_" + random();
  var q = {
    id: null,
    guid: null,
    name: {value: name, lang:"/lang/en"},
    key: {value: name.toLowerCase(), namespace: user_id},
    type: {id: "/type/domain"},
    create: "unconditional"
  };
  h.extend(q, options);
  var domain = acre.freebase.mqlwrite(q, {use_permission_of: user_id}).result;
  domain.name = domain.name.value;
  return domain;
};

/**
 * Delete test domain created by create_test_domain.
 * Caller must be authenticated and have permission on domain.
 * @param type:Object (required) - the domain returned by create_test_domain
 */
function delete_domain(domain) {
  var q = {
    guid: domain.guid,
    key: {value: domain.key.value, namespace: domain.key.namespace, connect: "delete"},
    type: {id: "/type/domain", connect: "delete"}
  };
  var deleted = acre.freebase.mqlwrite(q).result;
  deleted.domain = deleted["/type/type/domain"];
  return deleted;
};

/**
 * Create a minimal type in domain_id.
 * Caller must be authenticated and have permission on domain_id.
 * @param domain_id:String (required) - the domain id current authenticated user has permission on.
 * @param options:String (optional) - options to extend the create unconditional type clause.
 */
function create_type(domain_id, options) {
  var name = "test_type_" + random();
  var q = {
    id: null,
    guid: null,
    name: {value: name, lang: "/lang/en"},
    key: {value: name.toLowerCase(), namespace: domain_id},
    type: {id: "/type/type"},
    "/type/type/domain": {id: domain_id},
    create: "unconditional"
  };
  h.extend(q, options);
  var type = acre.freebase.mqlwrite(q, {use_permission_of: domain_id}).result;
  type.name = type.name.value;
  type.domain = type["/type/type/domain"];
  return type;
};

/**
 * Delete test type created by create_test_type.
 * Caller must be authenticated and have permission on type.
 * @param type:Object (required) - the type returned by create_test_type
 */
function delete_type(type) {
  // we need to look up type info since domain/namespace id may no longer be valid
  var type_info = acre.freebase.mqlread({
    guid: type.guid,
    key: [{value: null, namespace: null, optional:true}],
    "/type/type/domain": {id:null, optional:true}
  }).result;
  var q = {
    guid: type.guid,
    type: {id: "/type/type", connect: "delete"}
  };
  if (type_info) {
    if (type_info.key && type_info.key.length) {
      q.key = [{value:k.value, namespace:k.namespace, connect:"delete"} for each (k in type_info.key)];
    }
    if (type_info["/type/type/domain"]) {
      q["/type/type/domain"] = {id:type_info["/type/type/domain"].id, connect: "delete"};
    }
  }
  var deleted = acre.freebase.mqlwrite(q).result;
  deleted.domain = deleted["/type/type/domain"];
  return deleted;
};

/**
 * Create a minimal property in type_id.
 * Caller must be authenticated and have permission on type_id.
 * @param type_id:String (required) - the type id current authenticated user has permission on.
 * @param options:Object (optional) - options to extend the create unconditional property clause.
 */
function create_property(type_id, options) {
  var name = "test_property_" + random();
  var q = {
    id: null,
    guid: null,
    name: {value: name, lang: "/lang/en"},
    key: {value: name.toLowerCase(), namespace: type_id},
    type: {id: "/type/property"},
    "/type/property/schema": {id: type_id},
    create: "unconditional"
  };
  h.extend(q, options);
  var prop = acre.freebase.mqlwrite(q, {use_permission_of: type_id}).result;
  prop.name = prop.name.value;
  prop.schema = prop["/type/property/schema"];
  return prop;
};

/**
 * Delete test property created by create_test_property.
 * Caller must be authenticated and have permission on type.
 * @param prop:Object (required) - the property returned by create_test_property
 */
function delete_property(prop) {
  var q = {
    guid: prop.guid,
    key: {value: prop.key.value, namespace: prop.key.namespace, connect: "delete"},
    type: {id: "/type/property", connect: "delete"},
    "/type/property/schema": {id: prop.schema.id, connect: "delete"}
  };
  var deleted = acre.freebase.mqlwrite(q).result;
  deleted.schema = deleted["/type/property/schema"];
  return deleted;
};
