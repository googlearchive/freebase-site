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

var h = acre.require("core/helpers_url");
var scope = this;

test("parse_params", function() {
  same(h.parse_params({}), {});
  same(h.parse_params([]), {});
  equal(h.parse_params(), null);
  equal(h.parse_params(null), null);
  equal(h.parse_params(""), "");
  same(h.parse_params({a:1, b:2}), {a:1, b:2});
  same(h.parse_params([ ["a",1], ["b",2] ]), {a:1, b:2});
});

test("build_url", function() {
  equal(h.build_url(), "/");
  equal(h.build_url(null), "/");
  equal(h.build_url(null, null), "/");
  equal(h.build_url(null, ""), "/");
  equal(h.build_url(""), "/");
  equal(h.build_url("", null), "/");
  equal(h.build_url("", ""), "/");

  equal(h.build_url(null, "/path1"), "/path1");
  try {
    h.build_url(null, "path1");
    ok(false, "path must begin with a /");
  }
  catch(e) {
    ok(true, e);
  }
  equal(h.build_url(null, "/path1", "/path2", "/path3"), "/path1/path2/path3");
  equal(h.build_url(null, "/path1", "/path2", {a:1, b:2}),
        acre.form.build_url("/path1/path2", {a:1,b:2}));
  equal(h.build_url(null, "/path1", "/path2", "/path3", [ ["a",1], ["b",2] ]),
        acre.form.build_url("/path1/path2/path3", {a:1,b:2}));

  try {
    h.build_url("HOST");
    ok(false, "host must contain valid scheme");
  }
  catch (e) {
    ok(true, e);
  }

  equal(h.build_url("http://HOST", "/path1/path2", "/path3", {a:1, b:2}),
        acre.form.build_url("http://HOST/path1/path2/path3", {a:1,b:2}));
});

test("fb_url", function() {
  equal(h.fb_url(), "/");
  equal(h.fb_url(null), "/");
  equal(h.fb_url(""), "/");
  equal(h.fb_url("/path1", "/path2", {a:1}), "/path1/path2?a=1");
  equal(h.fb_url("/path1/path2", [["a",1]]), "/path1/path2?a=1");
});

test("resolve_reentrant_path", function() {
  var app_path = acre.request.script.app.path;
  var lib_path = acre.current_script.app.path;

  equal(h.resolve_reentrant_path(), app_path);
  equal(h.resolve_reentrant_path(null), app_path);
  equal(h.resolve_reentrant_path(""), app_path);
  equal(h.resolve_reentrant_path("foo"), app_path + "/foo");
  equal(h.resolve_reentrant_path("/foo"), app_path + "/foo");
  equal(h.resolve_reentrant_path("lib/foo"), lib_path + "/foo");
  equal(h.resolve_reentrant_path("/lib/foo"), app_path + "/lib/foo");

  equal(h.resolve_reentrant_path("//lib/foo"), "//lib/foo");
});

test("reentrant_url", function() {
  var app_path = acre.request.script.app.path
    .replace(/^\/\//, "/")
    .replace(".svn.freebase-site.googlecode.dev", "");
  var lib_path = acre.current_script.app.path
    .replace(/^\/\//, "/")
    .replace(".svn.freebase-site.googlecode.dev", "");

  equal(h.reentrant_url("/PREFIX"), "/PREFIX" + app_path);
  equal(h.reentrant_url("/PREFIX", null), "/PREFIX" + app_path);
  equal(h.reentrant_url("/PREFIX", ""), "/PREFIX" + app_path);
  equal(h.reentrant_url("/PREFIX", "foo"), "/PREFIX" + app_path + "/foo");
  equal(h.reentrant_url("/PREFIX", "/foo"), "/PREFIX" + app_path + "/foo");
  equal(h.reentrant_url("/PREFIX", "lib/foo"), "/PREFIX" + lib_path + "/foo");
  equal(h.reentrant_url("/PREFIX", "/lib/foo"), "/PREFIX" + app_path + "/lib/foo");
  equal(h.reentrant_url("/PREFIX", "//schema.www.trunk.svn.freebase-site.googlecode.dev/foo"),
        "/PREFIX/schema.www.trunk/foo");
  equal(h.reentrant_url("/PREFIX", "lib/foo", {a:1}),
        "/PREFIX" + lib_path + "/foo?a=1");
  equal(h.reentrant_url("/PREFIX", "foo/bar", {a:1}),
        "/PREFIX" + app_path + "/foo/bar?a=1");
});

test("ajax_url", function() {
  var app_path = acre.request.script.app.path
    .replace(/^\/\//, "/")
    .replace(".svn.freebase-site.googlecode.dev", "");
  var lib_path = acre.current_script.app.path
    .replace(/^\/\//, "/")
    .replace(".svn.freebase-site.googlecode.dev", "");
  var PREFIX = "/ajax";

  equal(h.ajax_url(), PREFIX + app_path);
  equal(h.ajax_url(null), PREFIX + app_path);
  equal(h.ajax_url(""), PREFIX + app_path);
  equal(h.ajax_url("foo"), PREFIX + app_path + "/foo");
  equal(h.ajax_url("/foo"), PREFIX + app_path + "/foo");
  equal(h.ajax_url("lib/foo"), PREFIX + lib_path + "/foo");
  equal(h.ajax_url("/lib/foo"), PREFIX + app_path + "/lib/foo");
  equal(h.ajax_url("//1b.schema.www.trunk.svn.freebase-site.googlecode.dev/foo"),
        PREFIX + "/1b.schema.www.trunk/foo");
  equal(h.ajax_url("lib/permission/has_permission", {id:"/en/foo"}),
        PREFIX + lib_path + "/permission/has_permission?id=/en/foo");
});

test("static_url", function() {
  var app_path = acre.request.script.app.path
    .replace(/^\/\//, "/")
    .replace(".svn.freebase-site.googlecode.dev", "");
  var lib_path = acre.current_script.app.path
    .replace(/^\/\//, "/")
    .replace(".svn.freebase-site.googlecode.dev", "");
  var PREFIX = (acre.get_metadata().static_base || "") + "/static";

  equal(h.static_url(), PREFIX + app_path);
  equal(h.static_url(null), PREFIX + app_path);
  equal(h.static_url(""), PREFIX + app_path);
  equal(h.static_url("foo"), PREFIX + app_path + "/foo");
  equal(h.static_url("/foo"), PREFIX + app_path + "/foo");
  equal(h.static_url("lib/foo"), PREFIX + lib_path + "/foo");
  equal(h.static_url("/lib/foo"), PREFIX + app_path + "/lib/foo");
  equal(h.static_url("//1b.schema.www.trunk.svn.freebase-site.googlecode.dev/foo"),
        PREFIX + "/1b.schema.www.trunk/foo");
});

test("legacy_fb_url", function() {
  var host = acre.freebase.site_host
    .replace('devel.', 'www.')
    .replace(':'+acre.request.server_port, '');
  equal(h.legacy_fb_url(), host);
  equal(h.legacy_fb_url(null), host);
  equal(h.legacy_fb_url(""), host);
  equal(h.legacy_fb_url("/private/suggest", {prefix:"a"}),
        host + "/private/suggest?prefix=a");
});

test("fb_api_url", function() {
  equal(h.fb_api_url(), acre.freebase.service_url);
  equal(h.fb_api_url(null), acre.freebase.service_url);
  equal(h.fb_api_url(""), acre.freebase.service_url);
  equal(h.fb_api_url("/api/service/mqlread", {q:"foo"}),
        acre.freebase.service_url + "/api/service/mqlread?q=foo");
});

test("wiki_url", function() {
  equal(h.wiki_url(), "http://wiki.freebase.com/wiki/");
  equal(h.wiki_url(null), "http://wiki.freebase.com/wiki/");
  equal(h.wiki_url(""), "http://wiki.freebase.com/wiki/");
  equal(h.wiki_url("Enumerated_types"), "http://wiki.freebase.com/wiki/Enumerated_types");
});


acre.test.report();

