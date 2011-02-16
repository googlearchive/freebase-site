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

acre.require('/test/lib').enable(this);

acre.require("lib/test/mock.sjs").playback(this, "test/playback_test_queries.json");

var h = acre.require("lib/helper/helpers.sjs");
var validators = acre.require("lib/validator/validators.sjs");
var q = acre.require("queries.sjs");

test("prop_counts", function() {
  var result;
  q.prop_counts("/en/united_states")
    .then(function(counts) {
      result = counts;
    });
  acre.async.wait_on_results();
  ok(result);
  ok(result.ti > 0, h.sprintf("incoming %s", result.ti));
  ok(result.to > 0, h.sprintf("outgoing %s", result.to));
});

test("names_aliases", function() {
  var result;
  q.names_aliases("/en/united_states")
    .then(function(names) {
      result = names;
    });
  acre.async.wait_on_results();
  ok(result && result.length);
});

test("names_aliases with filter", function() {
  var result;
  q.names_aliases("/en/united_states", {type:"/type/object"})
    .then(function(names) {
      result = names;
    });
  acre.async.wait_on_results();
  ok(result && result.length);
  result.forEach(function(name) {
    equal(name.master_property, "/type/object/name");
  });
});

test("keys", function() {
  var result;
  q.keys("/freebase")
    .then(function(keys) {
      result = keys;
    });
  acre.async.wait_on_results();
  ok(result && result.length);
});

test("keys with type filter", function() {
  var result;
  q.keys("/freebase", {type:"/type/namespace", limit:5})
    .then(function(keys) {
      result = keys;
    });
  acre.async.wait_on_results();
  equal(result.length, 5);
});

test("keys with property filter", function() {
  var result;
  q.keys("/freebase", {property:"/type/object/key"})
    .then(function(keys) {
      result = keys;
    });
  acre.async.wait_on_results();
  ok(!result.length);
});

test("outgoing", function() {
  var result;
  q.outgoing("/")
    .then(function(outgoing) {
      result = outgoing;
    });
  acre.async.wait_on_results();
  ok(result && result.length);
});

test("outgoing with filter", function() {
  var result;
  q.outgoing("/", {domain:"/type", limit:1})
    .then(function(outgoing) {
      result = outgoing;
    });
  acre.async.wait_on_results();
  equal(result.length, 1);
  equal(result[0].master_property.indexOf("/type/"), 0, result[0].master_property);
});

test("incoming", function() {
  var result;
  q.incoming("/en/united_states")
    .then(function(incoming) {
      result = incoming;
    });
  acre.async.wait_on_results();
  ok(result && result.length);
});

test("incoming with filter", function() {
  var result;
  q.incoming("/en/united_states", {property:"/people/person/nationality", limit:1})
    .then(function(incoming) {
      result = incoming;
    });
  acre.async.wait_on_results();
  equal(result.length, 1);
  equal(result[0].master_property, "/people/person/nationality");
});

test("type_links", function() {
  var result;
  q.type_links("/people/person/nationality")
    .then(function(typelinks) {
      result = typelinks;
    });
  acre.async.wait_on_results();
  ok(result && result.length);
});

test("type_links with filter", function() {
  var result;
  q.type_links("/people/person/nationality", {limit:1})
    .then(function(typelinks) {
      result = typelinks;
    });
  acre.async.wait_on_results();
  equal(result.length, 1);
});

test("attribution_links", function() {
  var result;
  q.attribution_links("/user/daepark")
    .then(function(attribution_links) {
      result = attribution_links;
    });
  acre.async.wait_on_results();
  ok(result && result.length);
});

test("attribution_links with filter", function() {
  var result;
  q.attribution_links("/user/daepark", {limit:1})
    .then(function(attribution_links) {
      result = attribution_links;
    });
  acre.async.wait_on_results();
  equal(result.length, 1);
});

test("mqlread_options", function() {
  deepEqual(q.mqlread_options(), {});
  deepEqual(q.mqlread_options(null), {});
  deepEqual(q.mqlread_options({as_of_time:null}), {});
  deepEqual(q.mqlread_options({as_of_time:"2010"}), {as_of_time:"2010"});
});

test("apply null filters", function() {
  ["limit", "timestamp", "creator", "history", "domain_type_property"].forEach(function(k) {
    deepEqual(q["apply_" + k]({}), {});
    deepEqual(q["apply_" + k]({}, null), {});
  });
});

test("apply_limit filter", function() {
  deepEqual(q.apply_limit({}, 500), {limit:500});
});

test("apply_timestamp filter", function() {
  var today = validators.Datejs("today");
  var yesterday =  validators.Datejs("yesterday");

  deepEqual(q.apply_timestamp({}, today), {
    "filter:timestamp>=": today
  });
  deepEqual(q.apply_timestamp({}, [yesterday, today]), {
    "filter:timestamp>=": yesterday,
    "filter:timestamp<": today
  });
});

test("apply_creator filter", function() {
  deepEqual(q.apply_creator({}, "/user/foo"), {"filter:creator": {"id|=": ["/user/foo"]}});
  deepEqual(q.apply_creator({}, ["/user/foo", "/user/bar", "/user/baz"]), {
    "filter:creator": {
      "id|=": ["/user/foo", "/user/bar", "/user/baz"]
    }
  });
});

test("apply_history filter", function() {
  deepEqual(q.apply_history({}, false), {});
  deepEqual(q.apply_history({}, true), {valid:null, operation:null});
});

test("apply_domain filter", function() {
  deepEqual(q.apply_domain_type_property({}, "/my/domain"), {
    "filter:master_property": {
      schema: {
        domain:"/my/domain"
      }
    }
  });
  deepEqual(q.apply_domain_type_property({master_property: "/type/namespace/keys"}, "/my/domain"), {
    master_property: "/type/namespace/keys",
    "filter:master_property": {
      schema: {
        domain: "/my/domain"
      }
    }
  });
});

test("apply_type filter", function() {
  deepEqual(q.apply_domain_type_property({}, null, "/my/type"), {
    "filter:master_property": {
      schema: "/my/type"
    }
  });
  // for /type/namespace/keys we are actually showing the reverse /type/object/key
  deepEqual(q.apply_domain_type_property({master_property: "/type/namespace/keys"}, null, "/my/type"), {
    master_property: "/type/namespace/keys",
    "filter:master_property": {
      schema: "/my/type"
    }
  });
});

test("apply_property filter", function() {
  deepEqual(q.apply_domain_type_property({}, null, null, "/my/property"), {
    "filter:master_property": "/my/property"
  });
  // for /type/namespace/keys we are actually showing the reverse /type/object/key
  deepEqual(q.apply_domain_type_property({master_property: "/type/namespace/keys"}, null, null, "/my/property"), {
    master_property: "/type/namespace/keys",
    "filter:master_property": "/my/property"
  });
});

acre.test.report();

