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

acre.require("lib/test/mock").playback(this, "test/playback_test_delete_property.json");

var freebase = acre.require("lib/promise/apis").freebase;
var test_helpers = acre.require("lib/test/helpers");
var delete_property = acre.require("delete_property").delete_property;
var undo = acre.require("delete_property").undo;

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

test("delete_property", function() {
  var type, type2, prop;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type2 = created;
    });
  acre.async.wait_on_results();
  ok(type2, "test type2 created");
  test_helpers.create_property2(type.mid, {"/type/property/expected_type": {id: type2.mid}})
    .then(function(created) {
      prop = created;
    });
  acre.async.wait_on_results();
  ok(prop, "test prop created");

  var info, result;
  delete_property(prop.mid, user.id, false, true)
    .then(function([i, r]) {
      info = i;
      result = r;
    });
  acre.async.wait_on_results();
  ok(info, "got delete_property info");
  ok(result, "got delete_property result");

  var check_result;
  freebase.mqlread({
    id: prop.mid,
    type: {
      id: "/type/property",
      optional: "forbidden"
    },
    key: {
      namespace: prop.key.namespace,
      value: prop.key.value,
      optional: "forbidden"
    },
    "/type/property/schema": {
      id: prop.schema.id,
      optional: "forbidden"
    },
    "/dataworld/gardening_task/async_delete": true
  })
  .then(function(env) {
    check_result = env.result;
  });
  acre.async.wait_on_results();
  ok(check_result, "got check result");
});


test("delete_property dry_run", function() {
  var type, type2, prop;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type2 = created;
    });
  acre.async.wait_on_results();
  ok(type2, "test type2 created");
  test_helpers.create_property2(type.mid, {"/type/property/expected_type": {id: type2.mid}})
    .then(function(created) {
      prop = created;
    });
  acre.async.wait_on_results();
  ok(prop, "test prop created");

  var info, result;
  delete_property(prop.mid, user.id, true)
    .then(function([i, r]) {
      info = i;
      result = r;
    });
  acre.async.wait_on_results();
  ok(info, "got delete_property info");
  ok(!result, "did not expect delete_property result");

  equal(info.guid, prop.guid, "property info.guid: " + info.guid);
});

test("undo", function() {
  var type, type2, prop;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type2 = created;
    });
  acre.async.wait_on_results();
  ok(type2, "test type2 created");
  test_helpers.create_property2(type.mid, {"/type/property/expected_type": {id: type2.mid}})
    .then(function(created) {
      prop = created;
    });
  acre.async.wait_on_results();
  ok(prop, "test prop created");

  var info, result;
  delete_property(prop.mid, user.id, false, true)
    .then(function([i, r]) {
      info = i;
      result = r;
    });
  acre.async.wait_on_results();
  ok(info, "got delete_property info");
  ok(result, "got delete_property result");

  // assert deleted
  ok(result.type.id === "/type/property" && result.type.connect === "deleted", "/type/property deleted");

  // undo
  var undo_info, undo_result;
  undo(info)
    .then(function([i, r]) {
      undo_info = i;
      undo_result = r;
    });
  acre.async.wait_on_results();
  ok(undo_info, "get undo info");
  ok(undo_result, "got undo result");


  var check_result;
  freebase.mqlread({
    id: prop.mid,
    type: {
      id: "/type/property"
    },
    key: {
      namespace: prop.key.namespace,
      value: prop.key.value
    },
    "/type/property/schema": {
      id: prop.schema.id
    },
    "/dataworld/gardening_task/async_delete": {
      value: true,
      optional: "forbidden"
    }
  })
  .then(function(env) {
    check_result = env.result;
  });
  acre.async.wait_on_results();
  ok(check_result, "got check result");
});

test("delete_property with master_property", function() {
  var type, type2, prop, prop2;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type2 = created;
    });
  acre.async.wait_on_results();
  ok(type2, "test type2 created");
  test_helpers.create_property2(type2.mid)
    .then(function(created) {
      prop2 = created;
    });
  acre.async.wait_on_results();
  ok(prop2, "test prop2 created");
  test_helpers.create_property2(type.mid, {"/type/property/master_property": {id: prop2.mid}})
    .then(function(created) {
      prop = created;
    });
  acre.async.wait_on_results();
  ok(prop, "test prop created");

  // check master_property
  var check_master;
  freebase.mqlread({
    id: prop.mid,
    "/type/property/master_property": null
  })
  .then(function(env) {
    check_master = env.result;
  });
  acre.async.wait_on_results();
  ok(check_master && check_master["/type/property/master_property"], "expected master_property on " + prop.id);

  var info, result;
  delete_property(prop.mid, user.id, false, true)
    .then(function([i, r]) {
      info = i;
      result = r;
    });
  acre.async.wait_on_results();
  ok(info, "got delete_property info");
  ok(result, "got delete_property result");

  // check master_property deleted
  var check_master_deleted;
  freebase.mqlread({
    id: prop.mid,
    "/type/property/master_property": null
  })
  .then(function(env) {
    check_master_deleted = env.result;
  });
  acre.async.wait_on_results();
  ok(check_master_deleted && !check_master_deleted["/type/property/master_property"],
     "expected master_property deleted on " + prop.id);

  // undo delete
  undo(info);
  acre.async.wait_on_results();

  // check master_property undo
  var check_master_undo;
  freebase.mqlread({
    id: prop.mid,
    "/type/property/master_property": null
  })
  .then(function(env) {
    check_master_undo = env.result;
  });
  acre.async.wait_on_results();
  ok(check_master_undo && check_master_undo["/type/property/master_property"],
     "expected master_property undo on " + prop.id);
});

test("delete_property with reverse_property", function() {
  var type, type2, prop, prop2;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type2 = created;
    });
  acre.async.wait_on_results();
  ok(type2, "test type2 created");
  test_helpers.create_property2(type2.mid)
    .then(function(created) {
      prop2 = created;
    });
  acre.async.wait_on_results();
  ok(prop2, "test prop2 created");
  test_helpers.create_property2(type.mid, {"/type/property/master_property": {id: prop2.mid}})
    .then(function(created) {
      prop = created;
    });
  acre.async.wait_on_results();
  ok(prop, "test prop created");

  // check master_property
  var check_reverse;
  freebase.mqlread({
    id: prop2.mid,
    "/type/property/reverse_property": null
  })
  .then(function(env) {
    check_reverse = env.result;
  });
  acre.async.wait_on_results();
  ok(check_reverse && check_reverse["/type/property/reverse_property"], "expected reverse_property on " + prop2.id);

  var info, result;
  delete_property(prop2.mid, user.id, false, true)
    .then(function([i, r]) {
      info = i;
      result = r;
    });
  acre.async.wait_on_results();
  ok(info, "got delete_property info");
  ok(result, "got delete_property result");

  // check reverse_property deleted
  var check_reverse_deleted;
  freebase.mqlread({
    id: prop2.mid,
    "/type/property/reverse_property": null
  })
  .then(function(env) {
    check_reverse_deleted = env.result;
  });
  acre.async.wait_on_results();
  ok(check_reverse_deleted && !check_reverse_deleted["/type/property/reverse_property"],
     "expected reverse_property deleted on " + prop2.id);

  // undo delete
  undo(info);
  acre.async.wait_on_results();

  // check reverse_property undo
  var check_reverse_undo;
  freebase.mqlread({
    id: prop2.mid,
    "/type/property/reverse_property": null
  })
  .then(function(env) {
    check_reverse_undo = env.result;
  });
  acre.async.wait_on_results();
  ok(check_reverse_undo && check_reverse_undo["/type/property/reverse_property"],
     "expected reverse_property undo on " + prop2.id);
});

test("delete_property with delegated property", function() {
  var type, type2, prop, prop2;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type2 = created;
    });
  acre.async.wait_on_results();
  ok(type2, "test type2 created");
  test_helpers.create_property2(type2.mid)
    .then(function(created) {
      prop2 = created;
    });
  acre.async.wait_on_results();
  ok(prop2, "test prop2 created");
  test_helpers.create_property2(type.mid, {"/type/property/delegated": {id: prop2.mid}})
    .then(function(created) {
      prop = created;
    });
  acre.async.wait_on_results();
  ok(prop, "test prop created");

  // check delegated
  var check_delegated;
  freebase.mqlread({
    id: prop.mid,
    "/type/property/delegated": null
  })
  .then(function(env) {
    check_delegated = env.result;
  });
  acre.async.wait_on_results();
  ok(check_delegated && check_delegated["/type/property/delegated"], "expected delegated on " + prop.id);

  var info, result;
  delete_property(prop.mid, user.id, false, true)
    .then(function([i, r]) {
      info = i;
      result = r;
    });
  acre.async.wait_on_results();
  ok(info, "got delete_property info");
  ok(result, "got delete_property result");

  // check delegated deleted
  var check_delegated_deleted;
  freebase.mqlread({
    id: prop.mid,
    "/type/property/delegated": null
  })
  .then(function(env) {
    check_delegated_deleted = env.result;
a  });
  acre.async.wait_on_results();
  ok(check_delegated_deleted && !check_delegated_deleted["/type/property/delegated"],
     "expected delegated deleted on " + prop.id);

  // undo delete
  undo(info);
  acre.async.wait_on_results();

  // check delegated undo
  var check_delegated_undo;
  freebase.mqlread({
    id: prop.mid,
    "/type/property/delegated": null
  })
  .then(function(env) {
    check_delegated_undo = env.result;
  });
  acre.async.wait_on_results();
  ok(check_delegated_undo && check_delegated_undo["/type/property/delegated"],
     "expected delegated undo on " + prop.id);
});

test("delete_property delegated by a property", function() {
  var type, type2, prop, prop2;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type2 = created;
    });
  acre.async.wait_on_results();
  ok(type2, "test type2 created");
  test_helpers.create_property2(type2.mid)
    .then(function(created) {
      prop2 = created;
    });
  acre.async.wait_on_results();
  ok(prop2, "test prop2 created");
  test_helpers.create_property2(type.mid, {"/type/property/delegated": {id: prop2.mid}})
    .then(function(created) {
      prop = created;
    });
  acre.async.wait_on_results();
  ok(prop, "test prop created");

  // check delegated_by
  var check_delegated;
  freebase.mqlread({
    id: prop2.mid,
    "!/type/property/delegated": null
  })
  .then(function(env) {
    check_delegated = env.result;
  });
  acre.async.wait_on_results();
  ok(check_delegated && check_delegated["!/type/property/delegated"], "expected delegated_by on " + prop2.id);

  var info, result;
  delete_property(prop2.mid, user.id, false, true)
    .then(function([i, r]) {
      info = i;
      result = r;
    });
  acre.async.wait_on_results();
  ok(info, "got delete_property info");
  ok(result, "got delete_property result");

  // check delegated_by deleted
  var check_delegated_deleted;
  freebase.mqlread({
    id: prop2.mid,
    "!/type/property/delegated": null
  })
  .then(function(env) {
    check_delegated_deleted = env.result;
a  });
  acre.async.wait_on_results();
  ok(check_delegated_deleted && !check_delegated_deleted["!/type/property/delegated"],
     "expected delegated_by deleted on " + prop2.id);

  // undo delete
  undo(info);
  acre.async.wait_on_results();

  // check delegated_by undo
  var check_delegated_undo;
  freebase.mqlread({
    id: prop2.mid,
    "!/type/property/delegated": null
  })
  .then(function(env) {
    check_delegated_undo = env.result;
  });
  acre.async.wait_on_results();
  ok(check_delegated_undo && check_delegated_undo["!/type/property/delegated"],
     "expected delegated_by undo on " + prop2.id);
});

acre.test.report();
