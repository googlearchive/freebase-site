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

var h = acre.require("helpers");

test("split_path", function() {
  var s = h.split_path;

  deepEqual(s("/script/extra/path"), ["script", "/extra/path", null]);
  deepEqual(s("/script/extra/path?foo=bar&hello=world"), ["script", "/extra/path", "foo=bar&hello=world"]);
  deepEqual(s("/script/extra/path?"), ["script", "/extra/path", ""]);

  deepEqual(s("/script.sjs"), ["script.sjs", "/", null]);
  deepEqual(s("/script.sjs/extra"), ["script.sjs", "/extra", null]);
  deepEqual(s("/script.sjs/extra?foo=bar"), ["script.sjs", "/extra", "foo=bar"]);

  deepEqual(s("/index"), ["index", "/", null]);
  deepEqual(s("/index?a=b&c=d"), ["index", "/", "a=b&c=d"]);

  deepEqual(s("/"), ["index", "/", null]);
  deepEqual(s("/?a=b&c=d"), ["index", "/", "a=b&c=d"]);

  deepEqual(s(""), ["index", "/", null]);
  deepEqual(s("?a=b&c=d"), ["index", "/", "a=b&c=d"]);
});


test("slit_extension", function() {
  var s = h.split_extension;

  deepEqual(s("foo.bar"), ["foo", "bar"]);
  deepEqual(s("foo"), ["foo", "sjs"]);

  deepEqual(s("/a/b/foo.bar"), ["/a/b/foo", "bar"]);
  deepEqual(s("/a/b/foo"), ["/a/b/foo", "sjs"]);

  deepEqual(s("/"), ["/", "sjs"]);
  deepEqual(s(""), ["", "sjs"]);
  deepEqual(s("/."), ["/", ""]);
  deepEqual(s("."), ["", ""]);
  deepEqual(s("/.mjt"), ["/", "mjt"]);
  deepEqual(s(".png"), ["", "png"]);
});


acre.test.report();

