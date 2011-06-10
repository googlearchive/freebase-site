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

var h = acre.require("helper/helpers_sprintf.sjs");
var template = acre.require("helper/test/sprintf_template.sjs");

test("sprintf", function() {
  equal(h.sprintf("%s%s%s", 1, 2, 3), "123");

  // named arguments
  equal(h.sprintf("%(a)s%(b)s%(c)s", {a:"a", b:"b", c:"c"}), "abc");
});

test("template_sprintf", function() {
  equal(h.template_sprintf("%s is a bold choice!",
                           template.embolden("Italic")).html,
        "<b>Italic</b> is a bold choice!");

  equal(h.template_sprintf("%s is still safe",
                           template.embolden("<script>alert(1);</script>")).html,
        "<b>&lt;script&gt;alert(1);&lt;/script&gt;</b> is still safe");

  equal(h.template_sprintf("Supports passthrough for %s",
                           "simple strings").html,
        "Supports passthrough for simple strings");

  equal(h.template_sprintf("But HTML escapes strings %s",
                           "<script>alert(1);</script>").html,
        "But HTML escapes strings &lt;script&gt;alert(1);&lt;/script&gt;");

  equal(h.template_sprintf("Even <script>%s</script> is escaped!",
                           "alert(1);").html,
        "Even &lt;script&gt;alert(1);&lt;/script&gt; is escaped!");

  equal(h.template_sprintf("%(em1)s and %(em2)s", {em1: template.embolden("EM 1"), em2: template.embolden("EM 2")}).html,
        "<b>EM 1</b> and <b>EM 2</b>");
});


acre.test.report();


