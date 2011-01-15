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
  deepEqual(h.parse_params({a:1,b:2}), {a:1,b:2});
  deepEqual(h.parse_params([['a',1],['b',2]]), {a:1,b:2});
  strictEqual(h.parse_params(), undefined);
  deepEqual(h.parse_params({}), {});
  deepEqual(h.parse_params([]), {});
});

function resource_url(apppath, file, params, extra_path) {
  var url = acre.host.protocol + ":" + apppath + "." + acre.host.name + (acre.host.port !== 80 ? (":" + acre.host.port) : "") + "/" + file + (extra_path || "");
  return acre.form.build_url(url, params);
};

test("fb_url", function() {
  equal(h.fb_url(), "/");
  equal(h.fb_url(null), "/");
  equal(h.fb_url(""), "/");
  equal(h.fb_url("/foo/bar"), "/foo/bar");
  equal(h.fb_url("/foo/bar", {a:1,b:2}), "/foo/bar?a=1&b=2");
  equal(h.fb_url(null, {a:1,b:2}), "/?a=1&b=2");
  equal(h.fb_url("/foo", "/en/bar"), "/foo/en/bar");
  equal(h.fb_url("/foo", "/en/bar", {a:1,b:2}), "/foo/en/bar?a=1&b=2");
});

test("legacy_fb_url", function() {
  var host =  acre.freebase.site_host.replace("devel.", "www.");
  equal(h.legacy_fb_url(), host);
  equal(h.legacy_fb_url(null), host);
  equal(h.legacy_fb_url(""), host);
  equal(h.legacy_fb_url("/foo/bar"), host + "/foo/bar");
  equal(h.legacy_fb_url("/foo/bar", {a:1,b:2}), host + "/foo/bar?a=1&b=2");
  equal(h.legacy_fb_url(null, {a:1,b:2}), host + "?a=1&b=2");
});

test("fb_api_url", function() {
  equal(h.fb_api_url(), acre.freebase.service_url);
  equal(h.fb_api_url(null), acre.freebase.service_url);
  equal(h.fb_api_url(""), acre.freebase.service_url);
  equal(h.fb_api_url("/foo/bar"), acre.freebase.service_url + "/foo/bar");
  equal(h.fb_api_url("/foo/bar", {a:1,b:2}), acre.freebase.service_url + "/foo/bar?a=1&b=2");
  equal(h.fb_api_url(null, {a:1,b:2}), acre.freebase.service_url + "?a=1&b=2");
});

acre.test.report();

