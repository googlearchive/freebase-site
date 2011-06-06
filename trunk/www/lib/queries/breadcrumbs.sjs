/*
 * Copyright 2011, Google Inc.
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
var i18n = acre.require("i18n/i18n.sjs");
var _ = i18n.gettext;
var freebase = acre.require("promise/apis.sjs").freebase;

/**
 * Breadcrumb queries for different types of objects
 */

function app(o) {
  return [
    {name:_("App")},
    {name:i18n.display_name(o)}
  ];
};

function domain(o) {
  return [
    {name:_("Domain")},
    {name:i18n.display_name(o)}
  ];
};

function type(o) {
  var q = {
    id: o.id,
    type: "/type/type",
    domain: {
      id: null,
      name: i18n.mql.query.name()
    }
  };
  return freebase.mqlread(q)
    .then(function(env) {
      var domain = env.result.domain;
      return [
        {name:_("Type")},
        {id:domain.id, name:i18n.display_name(domain)},
        {name:i18n.display_name(o)}
      ];
    });
};

function property(o) {
  var q = {
    id: o.id,
    type: "/type/property",
    schema: {
      id: null,
      name: i18n.mql.query.name(),
      domain: {
        id: null,
        name: i18n.mql.query.name()
      }
    }
  };
  return freebase.mqlread(q)
    .then(function(env) {
      var type = env.result.schema;
      var domain = type.domain;
      return [
        {name:_("Property")},
        {id:domain.id, name:i18n.display_name(domain)},
        {id:type.id, name:i18n.display_name(type)},
        {name:i18n.display_name(o)}
      ];
    });
};

function user(o) {
  return [
    {name:_("User")},
    {name:h.id_key(o.id)}
  ];
};


function topic(o) {
  return [
    {name:_("Topic")},
    {name:i18n.display_name(o)}
  ];
};

function object(o) {
  return [
    {name:_("Object")},
    {name:i18n.display_name(o)}
  ];
};
