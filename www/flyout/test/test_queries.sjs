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

var h = acre.require("lib/helper/helpers.sjs");
var q = acre.require("queries.sjs");
var apis = acre.require("lib/promise/apis.sjs");
var freebase = apis.freebase;
var deferred = apis.deferred;
var object_query = acre.require("site/queries/object.sjs");

acre.require("lib/test/mock.sjs").playback(this, "test/playback_test_queries.json");


function test_flyout(flyout_query, id) {
    var flyout;
    object_query.object(id)
        .then(function(object) {
            return flyout_query(object, "/lang/en");
        })
        .then(function(f) {
            flyout = f;
        });
    acre.async.wait_on_results();
    ok(flyout && flyout.summary && flyout.summary.length);
};


test("acre_app", function() {
    test_flyout(q.acre_app, "/user/daepark/postmessage");
});

test("domain", function() {
    var domains = [
        "/film",
        "/user/daepark/default_domain"
    ];
    domains.forEach(function(domain) {
        (function() {
            test_flyout(q.domain, domain);
        })();
    });
});

test("type", function() {
    var types = [
        "/film/film"
    ];
    types.forEach(function(type) {
        (function() {
            test_flyout(q.type, type);
        })();
    });
});

test("property", function() {
    var props = [
        "/film/film/initial_release_date"
    ];
    props.forEach(function(prop) {
        (function() {
            test_flyout(q.property, prop);
        })();
    });
});


test("user", function() {
    var users = [
        "/user/daepark",
        "/user/jdouglas",
        "/user/tfmorris"
    ];
    users.forEach(function(user) {
        (function() {
            test_flyout(q.user, user);
        })();
    });    
});

test("query", function() {
    var queries = [
        "/user/jdouglas/default_domain/views/stuttering_bands_view"
    ];
    queries.forEach(function(query) {
        (function() {
            test_flyout(q.query, query);
        })();
    });    
});

test("image", function() {
    var images = [
        "/m/0dj6rld"
    ];
    images.forEach(function(image) {
        (function() {
            test_flyout(q.image, image);
        })();
    });
});

test("book_edition", function() {
    var editions = [
        "/m/04vcf2h"
    ];
    editions.forEach(function(edition) {
        (function() {
            test_flyout(q.book_edition, edition);
        })();
    });
});

test("topic", function() {
    test_flyout(q.topic, "/en/barack_obama");
});

acre.test.report();
