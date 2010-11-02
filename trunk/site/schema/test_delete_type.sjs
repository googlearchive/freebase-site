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
var h = mf.require("test", "helpers");
var delete_type = mf.require("delete_type").delete_type;
var undo = mf.require("delete_type").undo;

// this test requires user to be logged in
var user = acre.freebase.get_user_info();

test("login required", function() {
  ok(user, "login required");
});

if (!user) {
  acre.test.report();
  acre.exit();
}

var user_domain = user.id + "/default_domain";

test("delete_type", function() {
  var type = h.create_type(user_domain);
  try {
    var info, result;
    delete_type(type.id, user.id)
      .then(function([type_info, delete_result]) {
        info = type_info;
        result = delete_result;
      });
    acre.async.wait_on_results();
    ok(result);

    ok(result.type.id === "/type/type" &&
       result.type.connect === "deleted", "type link deleted: " + type.id);

    ok(result.key[0].value === type.key.value &&
       result.key[0].namespace === type.key.namespace &&
       result.key[0].connect === "deleted", "key deleted: " + type.key.value);

    ok(result.domain.id === type.domain.id &&
       result.domain.connect === "deleted", "domain link deleted: " + type.domain.id);

    ok(result["/dataworld/gardening_task/async_delete"].value === true &&
       result["/dataworld/gardening_task/async_delete"].connect === "inserted",
       "/dataworld/gardening_task/async_delete set");
  }
  finally {
    if (type) {
      h.delete_type(type);
    }
  }
});


test("delete_type dry_run", function() {
  var type = h.create_type(user_domain);
  try {
    var info, result;
    delete_type(type.id, user.id, true)
      .then(function([type_info, delete_result]) {
        info = type_info;
        result = delete_result;
      });
    acre.async.wait_on_results();
    ok(info, JSON.stringify(info));
    ok(!result, JSON.stringify(result));

    equal(info.id, type.id, "type info.id: " + info.id);
    ok(info.key[0].value === type.key.value &&
       info.key[0].namespace === type.key.namespace, "type info.key: " + type.key.value);

    ok(info.domain.id === type.domain.id, "type info.domain: " + type.domain.id);
  }
  finally {
    if (type) {
      h.delete_type(type);
    }
  }
});


test("undo", function() {
  var type = h.create_type(user_domain);
  try {
    var info, result;
    delete_type(type.id, user.id)
      .then(function([type_info, delete_result]) {
        info = type_info;
        result = delete_result;
      });
    acre.async.wait_on_results();
    // assert deleted
    ok(result.type.id === "/type/type" && result.type.connect === "deleted", JSON.stringify(result));

    // undo
    undo(info)
      .then(function([type_info, undo_result]) {
        info = type_info;
        result = undo_result;
      });
    acre.async.wait_on_results();
    ok(result);
    ok(result.type.id === "/type/type" && result.type.connect === "inserted", JSON.stringify(result));

    ok(result["/dataworld/gardening_task/async_delete"].value === true &&
       result["/dataworld/gardening_task/async_delete"].connect === "deleted",
       "/dataworld/gardening_task/async_delete unset");
  }
  finally {
    if (type) {
      h.delete_type(type);
    }
  }
});



test("delete_type expected_by property", function() {
  var type = h.create_type(user_domain);
  var type2 = h.create_type(user_domain);
  var prop = h.create_property(type.id, {"/type/property/expected_type": {id: type2.id}});

  // assert expected_type present
  var result = acre.freebase.mqlread({id:prop.id, type:"/type/property", expected_type: null}).result;
  equal(result.expected_type, type2.id);

  try {
    var info;
    delete_type(type2.id, user.id, false, true)
      .then(function([type_info, delete_result]) {
        info = type_info;
        result = delete_result;
      });
    acre.async.wait_on_results();
    ok(result);

    // prop.expected_type should have been deleted since user has permission on it
    result = acre.freebase.mqlread({id:prop.id, type:"/type/property", expected_type: null}).result;
    ok(!result.expected_type);

    // undo
    undo(info);
    acre.async.wait_on_results();

    // prop.expected_type should have been re-asserted on undo
    result = acre.freebase.mqlread({id:prop.id, type:"/type/property", expected_type: null}).result;
    equal(result.expected_type, type2.id);
  }
  finally {
    if (prop) h.delete_property(prop);
    if (type2) h.delete_type(type2);
    if (type) h.delete_type(type);
  }
});


acre.test.report();
