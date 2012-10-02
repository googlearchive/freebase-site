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
var i18n = acre.require("lib/i18n/i18n.sjs");
var apis = acre.require("lib/promise/apis");
var freebase = apis.freebase;
var deferred = apis.deferred;
var fh = acre.require("lib/filter/helpers.sjs");
var creator = acre.require("lib/queries/creator.sjs");
var links = acre.require("lib/queries/links.sjs");


/**
 * /type/object/key
 */
function get_type_object_key(id, filters, next, lang, extend_clause) {
    filters = h.extend({}, filters);
    return creator.by(filters.creator, "/type/user")
        .then(function(creator_clause) {
            var q = h.extend({
                type: "/type/link",
                master_property: "/type/namespace/keys",
                source: {
                    // this object (e.g., id) has a key in this namespace
                    id: null,
                    mid: null,
                    "/type/namespace/uri_template": {
                        template: null,
                        optional: true
                    }
                },     
                target: {
                    id: id,
                    mid: null
                },   
                target_value: {
                    // this is the key value
                    value: null
                },
                timestamp: null,
                sort: filters.sort === 'timestamp' ? 'timestamp' : '-timestamp',
                optional: true
            }, creator_clause, extend_clause);
            if (next) {
                if (filters.sort === 'timestamp') {
                    q['next:timestamp>'] = next;
                }
                else {
                    q['next:timestamp<'] = next;            
                }
            }
            apply_filters(q, filters);
            return freebase.mqlread([q], links.mqlread_options(filters))
                .then(function(env) {
                    return env.result;
                });
        });
};

/**
 * /type/namespace/keys
 */
function get_type_namespace_keys(id, filters, next, lang, extend_clause) {
    filters = h.extend({}, filters);
    return creator.by(filters.creator, "/type/user")
        .then(function(creator_clause) {
            var q = h.extend({
                type: "/type/link",
                master_property: "/type/namespace/keys",
                source: {
                    id: id,
                    "/type/namespace/uri_template": {
                        template: null,
                        optional: true
                    }
                },
                target: {
                    // this is the object that has the key in this namespace (e.g. id)
                    id: null,
                    mid: null
                },
                target_value: {
                    // this is the key value
                    value: null
                },
                timestamp: null,
                sort: filters.sort === 'timestamp' ? 'timestamp' : '-timestamp',
                optional: true
            }, creator_clause, extend_clause);
            if (next) {
                if (filters.sort === 'timestamp') {
                    q['next:timestamp>'] = next;
                }
                else {
                    q['next:timestamp<'] = next;            
                }
            }
            apply_filters(q, filters);
            return freebase.mqlread([q], links.mqlread_options(filters))
                .then(function(env) {
                    return env.result;
                });
        });
};

function apply_filters(q, filters) {
  if (!filters) {
    return q;
  }
  links.apply_timestamp(q, filters.timestamp, filters.sort);
  links.apply_historical(q, filters.historical);
};


function key_info(link) {
    var info = {
        value: link.target_value.value,
        decoded: acre.freebase.mqlkey_unquote(link.target_value.value),
        namespace: link.source.id,
        object: link.target.mid
    };
    if (link.source["/type/namespace/uri_template"] &&
        link.source["/type/namespace/uri_template"].template) {
        info.url = resolve_uri_template(link.source["/type/namespace/uri_template"].template, info.decoded);
    }
    return info;
};

function resolve_uri_template(template, key) {
    return template.replace(/\{key\}/g, key);
};
