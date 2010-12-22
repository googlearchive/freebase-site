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

mf.require("test", "mox").playback(this, "playback_test_queries_writes.json");

var q = mf.require("queries");
var test_helpers = mf.require("test", "helpers");
var h = mf.require("core", "helpers");
var freebase = mf.require("promise", "apis").freebase;

// this test requires user to be logged in
var user;
test("login required", function() {
  user = test_helpers.get_user_info();
  ok(user, "login required");
});
if (!user) {
  acre.test.report();
  acre.exit();
}

var user_domain = user.id + "/default_domain";

test("add_included_types", function() {
  var type;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");

  var result;
  q.add_included_types(type.mid, ["/people/person", "/film/actor"])
    .then(function(included) {
      result = included;
    });
  acre.async.wait_on_results();
  ok(result && result.length == 2, "/people/person and /film/actor have been included");
  var included = h.map_array(result, "id");
  ["/people/person", "/film/actor"].forEach(function(type) {
    ok(included[type], type + " is included");
  });

  // now mqlread and check included
  var mqlread_result = null;
  freebase.mqlread({id: type.mid, "/freebase/type_hints/included_types": [{id:null}]})
    .then(function(env) {
       mqlread_result = env.result && env.result["/freebase/type_hints/included_types"] || null;
    });
  acre.async.wait_on_results();
  ok( mqlread_result &&  mqlread_result.length == 2, "/people/person and /film/actor have been included");
  included = h.map_array( mqlread_result, "id");
  ["/people/person", "/film/actor"].forEach(function(type) {
    ok(included[type], type + " is included");
  });
});

test("delete_included_type", function() {
  var type;
  test_helpers.create_type2(user_domain, {"/freebase/type_hints/included_types": {id: "/people/person"}})
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");

  // make sure of included type
  equal(type["/freebase/type_hints/included_types"].id, "/people/person");

  var result;
  q.delete_included_type(type.mid, "/people/person")
    .then(function(deleted) {
      result = deleted;
    });
  acre.async.wait_on_results();
  ok(result, "got delete_included_type result");

  var mqlread_result = null;
  freebase.mqlread({id: type.mid, "/freebase/type_hints/included_types": {id: "/people/person", optional:true}})
    .then(function(env) {
       mqlread_result = env.result;
    });
  acre.async.wait_on_results();
  ok(! mqlread_result["/freebase/type_hints/included_types"], "/people/person should no longer be included");
});

test("add_instance", function() {
  var type;
  test_helpers.create_type2(user_domain, {
    "/freebase/type_hints/included_types": [{id: "/common/topic"},{id: "/people/person"}]
  })
  .then(function(created) {
    type = created;
  });
  acre.async.wait_on_results();
  ok(type, "test type created");

  var topic;
  freebase.mqlwrite({id:null, create:"unconditional"})
    .then(function(env) {
      topic = env.result;
    });
  acre.async.wait_on_results();
  ok(topic && topic.id, "new topic created");
  var result;
  q.add_instance(topic.id, type.mid)
    .then(function(instance) {
      result = instance;
    });
  acre.async.wait_on_results();
  ok(result, "got add_instance result");

  result = null;
  freebase.mqlread({id:topic.id, type:[{id:null}]})
    .then(function(env) {
      result = env.result;
    });
  acre.async.wait_on_results();
  ok(result, "got mqlread result");
  var types = h.map_array(result.type, "id");
  [type.id, "/common/topic", "/people/person"].forEach(function(t) {
    ok(types[t], t);
  });
});

test("delete_instance", function() {
  var topic;
  freebase.mqlwrite({id:null, type:"/people/person", create:"unconditional"})
    .then(function(env) {
      topic = env.result;
    });
  acre.async.wait_on_results();
  ok(topic && topic.id, "new topic created");
  var result;
  q.delete_instance(topic.id, "/people/person")
    .then(function(deleted) {
      result = deleted;
    });
  acre.async.wait_on_results();
  ok(result, "got deleted_instane result");

  var mqlread_result;
  freebase.mqlread({id:topic.id, type:null})
    .then(function(env) {
      mqlread_result = env.result;
    });
  acre.async.wait_on_results();
  ok(mqlread_result, "got mqlread result");
  ok(!mqlread_result.type, "topic is no longer typed /people/person");
});

test("ensure_namespace", function() {
  var user_ns;
  q.ensure_namespace(user.id)
    .then(function(namespace_id) {
      user_ns = namespace_id;
    });
  acre.async.wait_on_results();
  equal(user_ns, user.id);

  var test_ns;
  var ns = user.id + "/test_ensure_namespace";
  try {
    q.ensure_namespace(ns)
      .then(function(namespace_id) {
        return freebase.mqlread({id:namespace_id, mid:null})
          .then(function(env) {
            test_ns = env.result.mid;
          });
      });
    acre.async.wait_on_results();
    ok(test_ns, "got ensure_namespace result");
    // ensure same permission as the parent namespace
    var user_ns_permission;
    freebase.mqlread({id:user.id, permission:null})
      .then(function(env) {
        user_ns_permission = env.result.permission;
      });
    var test_ns_permission;
    freebase.mqlread({id:test_ns, permission:null})
      .then(function(env) {
        test_ns_permission = env.result.permission;
      });
    acre.async.wait_on_results();
    equal(test_ns_permission, user_ns_permission);
  }
  finally {
    if (test_ns) {
      freebase.mqlwrite({
        mid: test_ns,
        type: {
          id: "/type/namespace",
          connect: "delete"
        },
        key: {
          namespace: user.id,
          value: "test_ensure_namespace",
          connect: "delete"
        }
      })
      .then(function(env) {
        console.log("deleted test namespace", env);
      });
      acre.async.wait_on_results();
    }
  }
});

acre.test.report();

