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

function domains(options) {
  return [h.extend({
    id: null,
    guid: null,
    name: i18n.mql.query.name(),
    type: "/type/domain",
    key: [{namespace: "/", limit: 0}],
    types: {"id": null, type: "/type/type", "return": "count"}
  }, options)];
};

function domain(options) {
  return h.extend({
    id: null,
    guid: null,
    name: i18n.mql.query.name(),
    type: "/type/domain",
    timestamp: null,
    key: [{value: null, namespace: null}],
    creator: {id:null, name: i18n.mql.query.name()},
    owners: [{member: [{id:null, name: i18n.mql.query.name()}]}],
    "/common/topic/article": i18n.mql.query.article(),
    types: [{
      optional: true,
      limit: 1000,
      id: null,
      name: i18n.mql.query.name(),
      type: "/type/type",
      "/common/topic/article": i18n.mql.query.article(),
      properties: {optional: true, id: null, type: "/type/property", "return": "count"},
      "/freebase/type_hints/mediator": null,
      "/freebase/type_hints/enumeration": null,
      "!/freebase/domain_profile/base_type": {optional: "forbidden", id: null, limit: 0}
    }]
  }, options);
};

function type(options) {
  return h.extend({
    id: null,
    guid: null,
    name: i18n.mql.query.name(),
    type: "/type/type",
    timestamp: null,
    key: [{value: null, namespace: null}],
    creator: {id:null, name: i18n.mql.query.name()},
    "/common/topic/article": i18n.mql.query.article(),
    domain: {id: null, name: i18n.mql.query.name(), type: "/type/domain"},
    "/freebase/type_hints/mediator": null,
    "/freebase/type_hints/enumeration": null,
    "/freebase/type_hints/included_types": [{
      optional: true,
      id: null,
      name: i18n.mql.query.name(),
      type: "/type/type",
      index: null,
      sort: "index",
      "!/freebase/domain_profile/base_type": {optional: "forbidden", id: null, limit: 0}
    }],
    properties: [property({optional: true, index: null, sort: "index"})]
  }, options);
};

function property(options) {
  return h.extend({
    id: null,
    guid: null,
    name: i18n.mql.query.name(),
    type: "/type/property",
    key: [{namespace: null, value: null}],
    expected_type: {
      optional: true,
      id: null,
      name:  i18n.mql.query.name(),
      type: "/type/type",
      "/freebase/type_hints/mediator": null,
      "/freebase/type_hints/enumeration": null
    },
    master_property: {
      optional: true,
      id: null,
      name:  i18n.mql.query.name(),
      type: "/type/property",
      schema: {id: null, name: i18n.mql.query.name()},
      unique: null
    },
    reverse_property: {
      optional: true,
      id: null,
      name: i18n.mql.query.name(),
      type: "/type/property",
      schema: {id: null, name: i18n.mql.query.name()},
      unique: null
    },
    delegated: {optional: true, id: null, name: i18n.mql.query.name()},
    unit: {optional: true, id: null, name: i18n.mql.query.name()},
    enumeration: {optional: true, id: null, name: i18n.mql.query.name()},
    unique: null,
    "/freebase/property_hints/disambiguator": null,
    "/freebase/property_hints/display_none": null,
    "/freebase/documented_object/tip":  i18n.mql.query.text()
  }, options);
};



