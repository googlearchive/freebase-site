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
var i18n = acre.require("lib/i18n/i18n.sjs");

function assert_keys(scope, keys, o, null_check, source) {
  source = source || "unknown";
  var errors = [];
  keys.forEach(function(key) {
    if (!(key in o)) {
      errors.push(key + " missing");
    }
    else if (null_check && o[key] == null) {
      errors.push(key + " null");
    };
  });
  if (errors.length) {
    scope.ok(false, source + " keys: " + JSON.stringify(errors));
  }
  else {
    scope.ok(true, source + " keys: " + JSON.stringify(keys));
  }
};

function assert_mql_keys(scope, keys, o, null_check) {
  assert_keys(scope, keys, o, null_check, "mql");
};

function assert_bdb_keys(scope, keys, o, null_check, bdb_name) {
  assert_keys(scope, keys, o, null_check, "bdb " + bdb_name);
};

function assert_cdb_keys(scope, keys, o, null_check) {
  assert_keys(scope, keys, o, null_check, "cdb");
};

function assert_article(scope, keys, o, null_check) {
  var article = i18n.mql.result.article(o["/common/topic/article"]);
  if (article) {
    assert_cdb_keys(scope, keys, article, null_check);
  }
  else if (null_check) {
    scope.ok(false, "article is null");
  }
};

function assert_domain_keys(scope, domain) {
  assert_mql_keys(scope, ["id", "name", "types"], domain, true);
  assert_bdb_keys(scope, ["instance_count"], domain, true, "activity");
};


function assert_prop(scope, prop) {
  assert_mql_keys(scope, ["id", "name", "expected_type",
                   "tip", "disambiguator", "display_none"], prop, true);
  assert_mql_keys(scope, ["unique", "unit", "master_property", "reverse_property"], prop);
  if (prop.expected_type && typeof prop.expected_type === "object") {
    assert_mql_keys(scope, ["mediator", "enumeration"], prop.expected_type);
  }
}

function assert_type(scope, type) {
  assert_mql_keys(scope, ["id", "name", "domain",
                   "mediator", "enumeration",
                   "included_types",
                   "creator", "timestamp",
                   "properties"], type);
  assert_bdb_keys(scope, ["instance_count"], type, true, "activity");
  assert_article(scope, ["blurb", "blob"], type);
  if (type.properties && type.properties.length) {
    type.properties.forEach(function(p) {
      assert_prop(scope, p);
    });
  }
};
