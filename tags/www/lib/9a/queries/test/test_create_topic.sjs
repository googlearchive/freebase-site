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

acre.require("test/mock").playback(this, "queries/test/playback_test_create_topic.json");

var test_helpers = acre.require("test/helpers");
var create_topic = acre.require("queries/create_topic").create_topic;
var freebase = acre.require("promise/apis").freebase;

// this test requires user to be logged in
var user;
test("login required", function() {
  freebase.get_user_info()
    .then(function(user_info) {
      user = user_info;
    });
  acre.async.wait_on_results();
  ok(user, "login required");
});
if (!user) {
  acre.test.report();
  acre.exit();
}

var user_domain = user.id + "/default_domain";

function get_name() {
  return test_helpers.gen_test_name("test_create_topic_");
};

function check_blurb(document_id, expected_blurb) {
  // check blob
  var blurb;
  freebase.get_blob(document_id, "blurb")
    .then(function(blob) {
      blurb = blob.body;
    });
  acre.async.wait_on_results();
  equal(blurb, expected_blurb);
};

test("create_topic name", function() {
  var topic;
  var name = get_name();
  create_topic({
    name: name
  })
  .then(function(created) {
    topic = created;
  });
  acre.async.wait_on_results();
  ok(topic, "got create_topic result");

  var check_topic;
  freebase.mqlread({id:topic.id, name:null})
    .then(function(env) {
      check_topic = env.result;
    });
  acre.async.wait_on_results();
  ok(check_topic, "got check topic result");
  equal(check_topic.name, name);
});

test("create_topic type", function() {
  var topic;
  var name = get_name();
  create_topic({
    name: name,
    type: "/film/actor"
  })
  .then(function(created) {
    topic = created;
  });
  acre.async.wait_on_results();
  ok(topic, "got create_topic result");

  var check_topic;
  freebase.mqlread({id:topic.id, name:null, type:[]})
    .then(function(env) {
      check_topic = env.result;
    });
  acre.async.wait_on_results();
  ok(check_topic && check_topic.type, "got check topic result");

  // check for type AND included_types
  var types = {};
  check_topic.type.forEach(function(type_id) {
    types[type_id] = true;
  });
  ["/film/actor", "/people/person"].forEach(function(type_id) {
    ok(types[type_id], type_id);
  });
});

test("create_topic description", function() {
  var topic;
  var name = get_name();
  create_topic({
    name: name,
    description: name
  })
  .then(function(created) {
    topic = created;
  });
  acre.async.wait_on_results();
  ok(topic, "got create_topic result");

  var check_topic;
  freebase.mqlread({id:topic.id, name:null, "/common/topic/article":{id:null}})
    .then(function(env) {
      check_topic = env.result;
    });
  acre.async.wait_on_results();
  ok(check_topic, "got check topic result");

  check_blurb(check_topic["/common/topic/article"].id, name);
});

test("create_topic included_types", function() {
  var topic;
  var name = get_name();
  create_topic({
    name: name,
    type: "/film/actor",
    included_types: false
  })
  .then(function(created) {
    topic = created;
  });
  acre.async.wait_on_results();
  ok(topic, "got create_topic result");

  var check_topic;
  freebase.mqlread({id:topic.id, name:null, type:[]})
    .then(function(env) {
      check_topic = env.result;
    });
  acre.async.wait_on_results();
  ok(check_topic && check_topic.type, "got check topic result");

  // check for type AND included_types
  var types = {};
  check_topic.type.forEach(function(type_id) {
    types[type_id] = true;
  });
  ok(types["/film/actor"], "expected topic to be of type: /film/actor");
  ok(!types["/people/person"], "topic should not be of type: /people/person");
});

acre.test.report();
