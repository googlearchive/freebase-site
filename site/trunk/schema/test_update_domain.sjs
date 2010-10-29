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
var update_domain = mf.require("update_domain").update_domain;

// this test requires user to be logged in
var user = acre.freebase.get_user_info();

test("login required", function() {
  ok(user, "login required");
});

if (!user) {
  acre.test.report();
  acre.exit();
}

test("update_domain name", function() {
  var domain = h.create_domain(user.id);
  try {
    var updated;
    update_domain({
      id: domain.id,
      name: domain.name + "updated"
    })
    .then(function(id) {
      updated = id;
    });
    acre.async.wait_on_results();
    ok(updated, updated);

    var result = acre.freebase.mqlread({id:updated, name:null}).result;
    equal(result.name, domain.name + "updated");
  }
  finally {
    if (domain) {
      h.delete_domain(domain);
    }
  }
});


test("update_domain key", function() {
  var domain = h.create_domain(user.id);
  try {
    var updated;
    update_domain({
      id: domain.id,
      namespace: user.id,
      key: sh.generate_domain_key(domain.name+"updated")
    })
    .then(function(id) {
      updated = id;
    });
    acre.async.wait_on_results();
    ok(updated, updated);

    var result = acre.freebase.mqlread({id:updated, key:{namespace:user.id, value:null}}).result;
    equal(result.key.value, sh.generate_domain_key(domain.name+"updated"));
  }
  finally {
    if (domain) {
      h.delete_domain(domain);
    }
  }
});

test("update_domain description", function() {
  var domain = h.create_domain(user.id);
  try {
    var updated, description;
    update_domain({
      domain: user.id,
      id: domain.id,
      description: domain.name + "updated"
    })
    .then(function(id) {
      updated = id;
    });
    acre.async.wait_on_results();
    ok(updated, updated);

    var result = acre.freebase.mqlread({id: updated, "/common/topic/article": {id: null}}).result;
    var blurb = acre.freebase.get_blob(result["/common/topic/article"].id, "blurb").body;
    equal(blurb, domain.name + "updated");
  }
  finally {
    if (domain) {
      h.delete_domain(domain);
    }
  }
});



acre.test.report();
