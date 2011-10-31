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

acre.require("test/mock").playback(this, "flag/test/playback_test_queries.json");

var apis = acre.require("promise/apis");
var freebase = apis.freebase;
var deferred = apis.deferred;
var queries = acre.require("flag/queries.sjs");

var TEST_FLAGS = [
  "merge", ["/en/sakuragi_hanamichi", "/en/kaede_rukawa"],
  "split", ["/en/sakuragi_hanamichi"],
  "delete", ["/en/sakuragi_hanamichi"],
  "offensive", ["/en/sakuragi_hanamichi"]
 ];

test("create invalid", function() {
  try {
    queries.create("foo");
    ok(false, "expected exception for bad flag kind");
  }
  catch(ex) {
    ok(true, ex);
  }
  try {
    queries.create("split");
    ok(false, "expected exception for not specifying id");
  }
  catch(ex) {
    ok(true, ex);
  }
});

function check_test_flag(flag, kind, ids) {
  ok(flag, "created flag");
  ok(flag.kind && flag.item);
  same(flag.kind.id, queries.KINDS[kind]);
  same(flag.item.length, ids.length);
  ids.forEach(function(id, i) {
    same(flag.item[i].id, id);
  });
};

function clean_flag(f) {
  /**
   * TODO: Getting the following for direct acre.freebase.mqlwrite
   * Could not find OAuth credentials to sign a request to 'http://www.sandbox-freebase.com/api/service/mqlwrite'. Have you invoked 'acre.oauth.get_authorization' with the right provider?
   */
  if (false && f) {
    var q = {
      id: f.id,
      type: {
        id: "/freebase/review_flag",
        connect: "delete"
      },
      "/freebase/review_flag/kind": {
        id: f.kind.id,
        connect: "delete"
      }
    };
    if (f.item) {
      var item = q["/freebase/review_flag/item"] = [];
      f.item.forEach(function(i) {
        item.push({id:i.id, connect:"delete"});
      });
    }
    acre.freebase.mqlwrite(q, null, {http_bless:true});
  }
};

for (var i=0,l=TEST_FLAGS.length; i<l; i+=2) {
  var kind = TEST_FLAGS[i];
  var ids = TEST_FLAGS[i+1];
  test("create/undo " + kind, function() {
    var f;
    try {
      queries.create.apply(queries, [kind].concat(ids))
        .then(function(r) {
          f = r;
        });
      acre.async.wait_on_results();
      check_test_flag(f, kind, ids);

      var undo_result;
      queries.undo(f.id)
        .then(function(r) {
          undo_result = r;
        });
      acre.async.wait_on_results();

      var check_undo;
      var q = {
        id: f.id,
        type: null,
        "/freebase/review_flag/kind": null,
        "/freebase/review_flag/item": []
      };
      freebase.mqlread(q)
        .then(function(env) {
          check_undo = env.result;
        });
      ok(check_undo, "checking undo result");
      same(check_undo.type, null, "flag is de-typed (/freebase/review_flag)");
      same(check_undo["/freebase/review_flag/kind"], null, "flag has no kind");
      same(check_undo["/freebase/review_flag/item"], [], "flag has no item(s)");
    }
    finally {
      clean_flag(f);
    }
  });
};

acre.test.report();
