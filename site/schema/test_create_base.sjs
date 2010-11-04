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
var sh = mf.require("helpers");
var h = mf.require("test", "helpers");
var create_base = mf.require("create_base").create_base;

// this test requires user to be logged in
var user = acre.freebase.get_user_info();

test("login required", function() {
  ok(user, "login required");
});

if (!user) {
  acre.test.report();
  acre.exit();
}

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

function get_name() {
  return "test_create_base_" + h.random();
};

function delete_base(base) {
  var q = {
    guid: base.guid,
    key: {
      value: base.key.value,
      namespace: base.key.namespace,
      connect: "delete"
    },
    type: {
      id: "/type/domain",
      connect: "delete"
    }
  };
  return acre.freebase.mqlwrite(q).result;
};

test("create_base", function() {
  var base;
  try {
    var name = get_name();
    create_base({
      name: name,
      key: sh.generate_domain_key(name)
    })
    .then(function(r) {
      base = r;
    });
    acre.async.wait_on_results();
    ok(base, "base created");
    ok(base.id, base.id);
    ok(base.guid, base.guid);
    equal(base.key.value, sh.generate_domain_key(name));
    equal(base.key.namespace, "/base");

    // check user has permission
    var has_permission = acre.freebase.mqlread({
      id: base.id,
      permission: {permits: [{member: [{id: user.id}]}]}
    }).result;
    ok(has_permission, user.id + " has permission to " + base.id);

    // check is /type/domain
    var is_domain = acre.freebase.mqlread({
      id: base.id,
      type: "/type/domain"
    }).result;
    ok(is_domain, base.id + " is /type/domain");

    // check permits /boot/schema_group
    var permits_schema_group = acre.freebase.mqlread({
      id: base.id,
      permission: {permits: {id: "/boot/schema_group"}}
    }).result;
    ok(permits_schema_group, base.id + " permits /boot/schema_group");
  }
  finally {
    if (base) {
      delete_base(base);
    }
  }
});

test("create base with existing key", function() {
  var base;
  var error;
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
    ok(!base, "base not created");
    ok(error, ""+error);
  }
  finally {
    if (base) {
      delete_base(base);
    }
  }
});

test("create base with description", function() {
  var base;
  try {
    var name = get_name();
    create_base({
      name: name,
      key: sh.generate_domain_key(name),
      description: name
    })
    .then(function(r) {
      base = r;
    });
    acre.async.wait_on_results();
    ok(base, "base created");

    // assert /common/topic/article
    var result = acre.freebase.mqlread({
      id: base.id,
      "/common/topic/article": {
        id: null,
        permission: {
          id: null,
          "!/type/object/permission": {
            id: base.id
          }
        }
      }
    }).result;
    var blurb = acre.freebase.get_blob(result["/common/topic/article"].id, "blurb").body;
    equal(blurb, name);
  }
  finally {
    if (base) {
      delete_base(base);
    }
  }
});

acre.test.report();
