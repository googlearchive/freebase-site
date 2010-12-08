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
/**
 * In order to successfully RUN this test, you must be
 *
 * logged in on *freebase.com
 *
 * AND
 *
 * If on devel url
 *   1. have permission on /base OR
 *   2. have local write_user as appeditoruser with the auth secrect
 */
acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").mf;
var h = mf.require("test", "helpers");
var delete_domain = mf.require("delete_domain").delete_domain;

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

test("delete_domain no permission", function() {
  try {
    var result, error;
    delete_domain("/base/slamdunk", "/user/tfmorris", true)
      .then(function(info) {
        result = info;
      }, function(e) {
        error = e;
      });
    acre.async.wait_on_results();
    ok(error, error);
  }
  finally {
  }
});

test("delete_domain user default_domain", function() {
  try {
    var result, error;
    delete_domain(user_domain, user.id, true)
      .then(function(info) {
        result = info;
      }, function(e) {
        error = e;
      });
    acre.async.wait_on_results();
    ok(error, error);
  }
  finally {
  }
});

test("delete_domain commons domain", function() {
  try {
    var result, error;
    delete_domain("/freebase", user.id, true)
      .then(function(info) {
        result = info;
      }, function(e) {
        error = e;
      });
    acre.async.wait_on_results();
    ok(error, error);
  }
  finally {
  }
});

function assert_deleted_result(result, domain) {
  ok(result && result.length === 3);
  var domain_info = result[0];
  var deleted_base_key = result[1];
  var deleted_domain = result[2];

  ok(domain_info && deleted_base_key && deleted_domain);

  equal(deleted_domain.type.connect, "deleted", "/type/domain deleted");
  var is_type_domain = acre.freebase.mqlread({guid:domain.guid, type:"/type/domain"}).result;
  ok(!is_type_domain, "/type/domain delete confirmed");

  equal(deleted_domain.key.length, 1);
  equal(deleted_domain.key[0].value, domain.key.value);
  equal(deleted_domain.key[0].namespace, domain.key.namespace);
  equal(deleted_domain.key[0].connect, "deleted", "key deleted");
  var has_key = acre.freebase.mqlread({id:domain.guid, key:{value:domain.key.value, namespace:user.id}}).result;
  ok(!has_key, "key delete confirmed");

  // check "/dataworld/gardening_task/async_delete"
  ok(deleted_domain["/dataworld/gardening_task/async_delete"].value === true &&
     deleted_domain["/dataworld/gardening_task/async_delete"].connect === "inserted",
     "/dataworld/gardening_task/async_delete set");
  var async_delete =  acre.freebase.mqlread({id:domain.guid, "/dataworld/gardening_task/async_delete":null}).result;
  ok(async_delete["/dataworld/gardening_task/async_delete"],  "/dataworld/gardening_task/async_delete set confirmed");

  return result;
};

test("delete_domain user domain", function() {
  var domain = h.create_domain(user.id);
  try {
    var result;
    delete_domain(domain.id, user.id)
      .then(function(deleted_info) {
        result = deleted_info;
      });
    acre.async.wait_on_results();

    var [domain_info, deleted_base_key, deleted_domain] = assert_deleted_result(result, domain);

    // no base keys
    ok(!deleted_base_key.length);
  }
  finally {
    if (domain) {
      h.delete_domain(domain);
    }
  }
});


test("delete_domain with types", function() {
  var domain = h.create_domain(user.id);
  var type = h.create_type(domain.id);
  try {
    var result;
    delete_domain(domain.id, user.id)
      .then(function(deleted_info) {
        result = deleted_info;
      });
    acre.async.wait_on_results();
    var [domain_info, deleted_base_key, deleted_domain] = assert_deleted_result(result, domain);

    // assert type id is no longer valid
    result = acre.freebase.mqlread({id:type.id, type:"/type/type", domain:{id:null}}).result;
    ok(!result, type.id + " is no longer valid");
  }
  finally {
    if (type) {
      h.delete_type(type);
    }
    if (domain) {
      h.delete_domain(domain);
    }
  }
});

/**
// does current user have permission on /base?
var has_permission = acre.freebase.mqlread({
  id: "/base",
  permission: {permits: [{member: [{id: user.id}]}]}
}).result;

test(user.id + " has permission to /base", function() {
  ok(has_permission, "User needs permission to /base to run this test");
});

if (!has_permission) {
  acre.test.report();
  acre.exit();
}
**/

if (has_permission) {
  test("delete domain base domain", function() {
    var domain = h.create_domain(user.id);
    try {
      // add a base key
      acre.freebase.mqlwrite({
        id:domain.id, key:{value:domain.key.value, namespace:"/base", connect:"insert"}
      });
      var result;
      delete_domain(domain.id, user.id)
        .then(function(deleted_info) {
          result = deleted_info;
        });
      acre.async.wait_on_results();

      var [domain_info, deleted_base_key, deleted_domain] = assert_deleted_result(result, domain);

      // assert /base key is deleted
      equal(deleted_base_key.key.length, 1);
      equal(deleted_base_key.key[0].value, domain.key.value);
      equal(deleted_base_key.key[0].namespace, "/base");
      equal(deleted_base_key.key[0].connect, "deleted", "key deleted");
      var has_key = acre.freebase.mqlread({id:domain.guid, key:{value:domain.key.value, namespace:"/base"}}).result;
      ok(!has_key, "key delete confirmed");

    }
    finally {
      if (domain) {
        h.delete_domain(domain);
        acre.freebase.mqlwrite({
          guid:domain.guid, key:{value:domain.key.value, namespace:"/base", connect:"delete"}
        });
      }

    }
  });
}

acre.test.report();
