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

var tests = [
  {source:{id:"s"}, master_property:{id:"p"}, target:{id:"o"}},
  {id:"s", p:{id:"o"}},

  {"me:source":{id:"s"}, master_property:{id:"p"}, target:{id:"o"}},
  {id:"s", p:{id:"o"}},

  {source:{id:"s"}, master_property:{id:"p"}, "me:target":{id:"o"}},
  {id:"s", p:{id:"o"}},

  {source:{id:"s"}, master_property:{id:"p"}, target:null, target_value:{value:"o"}},
  {id:"s", p:{value:"o"}},

  {source:{id:"s"}, master_property:{id:"p"}, target:{id:"lang"}, target_value:{value:"o", lang:"lang"}},
  {id:"s", p:{value:"o", lang:"lang"}},

  {source:{id:"s"}, master_property:{id:"p"}, target:{id:"ns"}, target_value:{value:"o", namespace:"ns"}},
  {id:"s", p:{value:"o", namespace:"ns"}},

  {source:{id:"s"}, master_property:{id:"p"}, target:{id:"o"}, valid:true},
  {id:"s", p:{id:"o"}},

  {source:{id:"s"}, master_property:{id:"p"}, target:{id:"o"}, valid:false, operation:"delete"},
  {id:"s", p:{id:"o", link:{valid:false, timestamp:null, operation:"delete"}}}

];

test("query", tests, function() {
  for(var i=0,l=tests.length; i<l; i+=2) {
    deepEqual(h.query(tests[i]), tests[i+1]);
  }
});

test("is_valid", function() {
  equal(h.is_valid({}), true, "valid");
  equal(h.is_valid({valid:false}), false, "invalid");
  equal(h.is_valid({valid:true}), true, "valid");
});

test("valid_class", function() {
  equal(h.valid_class({}), "valid");
  equal(h.valid_class({valid:false}), "invalid");
  equal(h.valid_class({valid:true}), "valid");
});

test("link_class", function() {
  equal(h.link_class({}), "valid");
  equal(h.link_class({valid:false, operation:"foo"}), "invalid foo");
  equal(h.link_class({valid:true, operation:"update"}), "valid update");
});

acre.test.report();
