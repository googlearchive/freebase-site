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

var mf = acre.require("MANIFEST").mf;
var q = mf.require("queries");
var h = mf.require("core", "helpers");

["/en/jack_kerouac", "/guid/9202a8c04000641f80000000059587ef"].forEach(function(id) {
  test("topic", function() {
    var result;
    q.topic(id)
      .then(function(topic) {
         result = topic;
      });
    acre.async.wait_on_results();
    ok(result);
  });
});

test("topic as_of_time", function() {
  var result;
  q.topic("/en/lady_gaga", {as_of_time:"2008"})
    .then(function(topic) {
       result = topic;
    });
  acre.async.wait_on_results();
  ok(!result);
});

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
    equal(name.link.master_property, "/type/object/name");
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

test("keys with filter", function() {
  var result;
  q.keys("/freebase", {type:"/type/namespace"})
    .then(function(keys) {
      result = keys;
    });
  acre.async.wait_on_results();
  ok(!result.length);
});

test("keys with filter", function() {
  var result;
  q.keys("/freebase", {property:"/type/object/key", limit:5})
    .then(function(keys) {
      result = keys;
    });
  acre.async.wait_on_results();
  equal(result.length, 5);
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
  equal(result[0].link.master_property.indexOf("/type/"), 0, result[0].link.master_property);
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
  equal(result[0].link.master_property, "/people/person/nationality");
});

test("typelinks", function() {
  var result;
  q.typelinks("/people/person/nationality")
    .then(function(typelinks) {
      result = typelinks;
    });
  acre.async.wait_on_results();
  ok(result && result.length);
});

test("typelinks with filter", function() {
  var result;
  q.typelinks("/people/person/nationality", {limit:1})
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

acre.test.report();

