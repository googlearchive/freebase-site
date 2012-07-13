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

acre.require('/test/lib').enable(this);

acre.require("test/mock").playback(this, "schema/test/playback_test_delete_property.json");

var freebase = acre.require("promise/apis.sjs").freebase;
var test_helpers = acre.require("test/helpers.sjs");
var delete_property = acre.require("schema/delete_property.sjs").delete_property;

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

  var info;
  delete_property(prop.mid, user.id)
    .then(function(deleted) {
      info = deleted;
    });
  acre.async.wait_on_results();
  ok(info, "got delete_property info");

  var check_result;
  freebase.mqlread({
    id: prop.guid,
    type: {
      id: "/type/property"
    },
    key: [{
      namespace: null,
      value: null
    }],
    "/type/property/schema": {
      id: null
    }
  })
  .then(function(env) {
    check_result = env.result;
  });
  acre.async.wait_on_results();
  ok(!check_result, "Expected deleted property: " + JSON.stringify(check_result));
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
    mid: prop.mid,
    "/type/property/master_property": {
        id: null
    }
  })
  .then(function(env) {
    check_master = env.result;
  });
  acre.async.wait_on_results();
  ok(check_master, "expected master_property on " + prop.id);

  var info;
  delete_property(prop.mid, user.id)
    .then(function(deleted) {
      info = deleted;
    });
  acre.async.wait_on_results();
  ok(info, "got delete_property info");

  // check master_property deleted
  var check_master_deleted;
  freebase.mqlread({
    mid: prop.mid,
    "/type/property/master_property": {
        id: null
    }
  })
  .then(function(env) {
    check_master_deleted = env.result;
  });
  acre.async.wait_on_results();
  ok(!check_master_deleted,
     "expected master_property deleted on " + JSON.stringify(check_master_deleted));
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
    mid: prop2.mid,
    "/type/property/reverse_property": {
        id: null
    }
  })
  .then(function(env) {
    check_reverse = env.result;
  });
  acre.async.wait_on_results();
  ok(check_reverse, "expected reverse_property on " + prop2.id);

  var info, error;
  delete_property(prop2.mid, user.id)
    .then(function(deleted) {
      info = deleted;
    }, function(e) {
      error = e;
    });
  acre.async.wait_on_results();
  ok(error, "got delete_property error: " + error);
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
    mid: prop.mid,
    "/type/property/delegated": {
        id: null
    }
  })
  .then(function(env) {
    check_delegated = env.result;
  });
  acre.async.wait_on_results();
  ok(check_delegated, "expected delegated on " + prop.id);

  var info;
  delete_property(prop.mid, user.id)
    .then(function(deleted) {
      info = deleted;
    });
  acre.async.wait_on_results();
  ok(info, "got delete_property info");

  // check delegated deleted
  var check_delegated_deleted;
  freebase.mqlread({
    mid: prop.mid,
    "/type/property/delegated": {
        id: null
    }
  })
  .then(function(env) {
    check_delegated_deleted = env.result;
a  });
  acre.async.wait_on_results();
  ok(!check_delegated_deleted,
     "expected delegated deleted on " + JSON.stringify(check_delegated_deleted));
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
    mid: prop2.mid,
    "!/type/property/delegated": {
        id: null
    }
  })
  .then(function(env) {
    check_delegated = env.result;
  });
  acre.async.wait_on_results();
  ok(check_delegated, "expected delegated_by on " + prop2.id);

  var info, error;
  delete_property(prop2.mid, user.id)
    .then(function(deleted) {
      info = deleted;
    }, function(e) {
      error = e;
    });
  acre.async.wait_on_results();
  ok(error, "got delete_property error: " + error);
});

acre.test.report();
