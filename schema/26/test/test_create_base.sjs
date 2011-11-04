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

acre.require("lib/test/mock").playback(this, "test/playback_test_create_base.json");

var schema_helpers = acre.require("helpers");
var test_helpers = acre.require("lib/test/helpers");
var create_base = acre.require("create_base").create_base;
var freebase = acre.require("lib/promise/apis").freebase;

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

function get_name() {
  return test_helpers.gen_test_name("test_create_base_");
};

function delete_base(key) {
  return freebase.mqlread({
    id: null,
    mid: null,
    key: {
      namespace: "/base",
      value: key
    },
    "a:key": [{
      namespace: null,
      value: null
    }]
  })
  .then(function(env) {
    var existing = env.result;
    if (existing) {
      return freebase.mqlwrite({
        id: existing.mid,
        key: {
          namespace: "/base",
          value: key,
          connect: "delete"
        }
      }, null, {http_sign: false})
      .then(function() {
        var q = {
          id: existing.mid,
          type: {
            id : "/type/domain",
            connect: "delete"
          }
        };
        var keys = [];
        existing["a:key"].forEach(function(k) {
          if (k.namespace !== "/base") {
            keys.push({namespace:k.namespace, value:k.value, connect:"delete"});
          }
        });
        return freebase.mqlwrite(q);
      });
    }
    else {
      return true;
    }
  });
};

test("create_base", function() {
  var name = get_name();
  var key = schema_helpers.generate_domain_key(name);
  var base;
  delete_base(key)
    .then(function() {
      return create_base({
        name: name,
        key: key
      })
      .then(function(r) {
        base = r;
      });
    });
  acre.async.wait_on_results();
  ok(base, "base created");
  ok(base.id, base.id);
  ok(base.mid, base.mid);
  equal(base.key.value, key);
  equal(base.key.namespace, "/base");

  // check user has permission
  var has_permission;
  freebase.mqlread({
    id: base.mid,
    permission: {permits: [{member: [{id: user.id}]}]}
  })
  .then(function(env) {
    has_permission = env.result;
  });
  acre.async.wait_on_results();
  ok(has_permission, user.id + " has permission to " + base.id);

  // check owners
  var owners;
  freebase.mqlread({
    id: base.mid,
    "/type/domain/owners": [{member: [{id: user.id}]}]
   })
  .then(function(env) {
    owners = env.result;
  });
  acre.async.wait_on_results();
  ok(owners, user.id + " is an owner of " + base.id);

  // check is /type/domain
  var is_domain;
  freebase.mqlread({
    id: base.mid,
    type: "/type/domain"
  })
  .then(function(env) {
    is_domain = env.result;
  });
  acre.async.wait_on_results();
  ok(is_domain, base.id + " is /type/domain");

  // check permits /boot/schema_group
  var permits_schema_group;
  freebase.mqlread({
    id: base.mid,
    permission: {permits: {id: "/boot/schema_group"}}
  })
  .then(function(env) {
    permits_schema_group = env.result;
  });
  acre.async.wait_on_results();
  ok(permits_schema_group, base.id + " permits /boot/schema_group");
});

test("create base with existing key", function() {
  var base, error;
  try {
    var name = get_name();
    create_base({
      name: "SLAMDUNK",
      key: "slamdunk"
    })
    .then(function(r) {
      base = r;
    }, function(e) {
      error = e;
    });
    acre.async.wait_on_results();
    ok(!base, "expected error");
    ok(error, "expected error: " + error);
  }
  finally {
    if (base) {
      delete_base(base);
    }
  }
});

test("create base with description", function() {
  var name = get_name();
  var key = schema_helpers.generate_domain_key(name);
  var base;
  delete_base(key)
    .then(function() {
      return create_base({
        name: name,
        key: key,
        description: name
      })
      .then(function(r) {
        base = r;
      });
    });
  acre.async.wait_on_results();
  ok(base, "base created");

  var check_result;
  freebase.mqlread({
   id: base.mid,
   "/common/topic/article": {
      id: null,
      permission: {
        id: null,
        "!/type/object/permission": {
          mid: base.mid
        }
      }
    }
  })
  .then(function(env) {
    check_result = env.result;
  });
  acre.async.wait_on_results();
  ok(check_result, "got check result");
  ok(check_result["/common/topic/article"], "got check result article: " + check_result["/common/topic/article"].id);

  var blurb;
  freebase.get_blob(check_result["/common/topic/article"].id, "blurb")
    .then(function(blob) {
      blurb = blob.body;
    });
  acre.async.wait_on_results();
  equal(blurb, name);
});

acre.test.report();
