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

var h = acre.require("helper/helpers_mql.sjs");


function role(mediator, enumeration) {
  return {
    mediator: mediator === true,
    enumeration: enumeration === true
  };
}

var role_tests = [
  {},
  role(false, false),

  {"/freebase/type_hints/mediator": true},
  role(true, false),

  {"/freebase/type_hints/mediator": false, "/freebase/type_hints/enumeration": true},
  role(false, true),

  {"/freebase/type_hints/mediator": true, "/freebase/type_hints/enumeration": true},
  role(true, true)

];

test("get_type_role", role_tests, function() {

  for (var i=0,l=role_tests.length; i<l; i+=2) {
    deepEqual(h.get_type_role(role_tests[i]), role_tests[i+1]);
  }

});

test("id_key", function() {
  same(h.id_key("/"), "");
  same(h.id_key("/", true), ["/", ""]);
  same(h.id_key("/a"), "a");
  same(h.id_key("/a", true), ["/", "a"]);
  same(h.id_key("/a/b/c"), "c");
  same(h.id_key("/a/b/c", true), ["/a/b", "c"]);
  same(h.id_key("abc"), "abc");
  same(h.id_key("abc", true), ["/", "abc"]);
});

test("lang_code", function() {
  same(h.lang_code("/lang/en"), "en");
  same(h.lang_code("/lang/en-gb"), "en-gb");
});

test("fb_object_type", function() {

  // Test Property label
  var test_property_object = {"/type/property": {}};
  equal(h.fb_object_type(test_property_object, "/film/film/directed_by"), "Property");

  // Test Type label
  var test_type_object = {"/type/type": {}};
  equal(h.fb_object_type(test_type_object, "/film/film"), "Type");

  // Test Domain labels for Commons, Bases, and User
  var test_domain_object = {"/type/domain": {}};
  equal(h.fb_object_type(test_domain_object, "/film"), "Commons Domain");
  equal(h.fb_object_type(test_domain_object, "/base/surfing"), "User Domain");
  equal(h.fb_object_type(test_domain_object, "/user/kconragan/default_domain"), "User Domain");

  // Test Acre app label
  // It's important his has both /freebase/apps/acre_app and /common/topic
  // Acre App trumps Topic
  var test_app_object = {"/type/domain":{}, "/common/topic":{}, "/freebase/apps/acre_app":{}, "/freebase/apps/application":{}};
  equal(h.fb_object_type(test_app_object, "/user/stefanomazzocchi/matchmaker"), "Acre App");

  var test_user_object = {"/type/user": {}};
  equal(h.fb_object_type(test_user_object, "/user/kconragan"), "User");
});


test("is_metaweb_system_type", function() {
  var tests = {
    "/common/document": true,
    "/common/image": true,
    "/common/topic": false,
    "/film/film": false,
    "/freebase/domain_profile": true,
    "/freebase/property_profile": true,
    "/freebase/type_profile": true,
    "/freebase/user_profile": true,
    "/type/domain": true,
    "/type/namespace": true,
    "/type/object": true,
    "/type/permission": true,
    "/type/property": true,
    "/type/type": true,
    "/type/user": true
  };

  for (var id in tests) {
    same(h.is_metaweb_system_type(id), tests[id], id);
  };
});

acre.test.report();


