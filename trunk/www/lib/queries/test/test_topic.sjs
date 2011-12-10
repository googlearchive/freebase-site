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

acre.require("test/mock").playback(this, "queries/test/playback_test_topic.json");

var h = acre.require("helper/helpers.sjs");
var queries = acre.require("queries/topic.sjs");


test("topic_structure", function() {
  var result;
  queries.topic_structure("/en/daesun_park", "en")
    .then(function(topic) {
      result = topic;
    });
  acre.async.wait_on_results();
  ok(result, "Got topic_structure result");
  ok(result.topic, "Got topic");
  ok(result.structure, "Got structure");
  ok(result.structure.order && h.isArray(result.structure.order), "Expected structure.order to be an Array");
  // /people should be in the structure
  ok(result.structure.order.indexOf("/people") !== -1, "Expected /people domain in structure.order");
  ok(result.structure.domains && result.structure.domains["/people"], "Expected /people domain in structure.domains");
  var people_domain = result.structure.domains["/people"];
  // /people/person should be in the structure
  ok(people_domain.types && people_domain.types.indexOf("/people/person") !== -1,
     "Expected /people/person type in structure.domains['/people'].types");
  ok(result.structure.types && result.structure.types["/people/person"],
     "Expected /people/person type in structure.types");
  var person_type = result.structure.types["/people/person"];
  // /people/person/date_of_birth should be in the structure since it's a disambiguating property
  ok(person_type.properties && person_type.properties.indexOf("/people/person/date_of_birth") !== -1,
     "Expected /people/person/date_of_birth in structure.types['/people/person'].properties");
  ok(result.structure.properties && result.structure.properties["/people/person/date_of_birth"],
     "Expected /people/person/date_of_birth in structure.properties");
});

acre.test.report();
