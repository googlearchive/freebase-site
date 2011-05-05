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

acre.require("test/mock").playback(this, "propbox/test/playback_test_helpers.json");

var h = acre.require("helper/helpers.sjs");
var ph = acre.require("propbox/helpers.sjs");
var i18n = acre.require("i18n/i18n.sjs");
var freebase = acre.require("promise/apis.sjs").freebase;
var queries = acre.require("propbox/queries.sjs");
var topic_api = acre.require("queries/topic.sjs");
var validators = acre.require("validator/validators.sjs");

test("data_input_type", function() {
  var tests = [
  "/type/int", "int",
  "/type/float", "float",
  "/type/boolean", "boolean",
  "/type/rawstring", "rawstring",
  "/type/uri", "uri",
  "/type/text", "text",
  "/type/datetime", "datetime",
  "/type/id", "id",
  "/type/key", "key",
  "/type/value", "value",
  "/type/enumeration", "enumeration"
  ];
  for (var i=0,l=tests.length; i<l; i+=2) {
    same(ph.data_input_type(tests[i]), tests[i+1]);
  }
  same(ph.data_input_type(), "");
  same(ph.data_input_type(null), "");
  same(ph.data_input_type("/film/film"), "topic");
});

test("minimal_prop_structure", function() {
  var topic;  // topic data from topic api
  topic_api.topic("/en/bob_dylan", "/lang/en")
    .then(function(t) {
      topic = t;
    });
  acre.async.wait_on_results();
  ok(topic, "Got topic");

  function test_minimal(schema, structure, lang) {
    var ect = schema.expected_type;
    structure = h.extend(true, {}, structure, {
      id: schema.id,
      expected_type: {
        mediator: ect["/freebase/type_hints/mediator"] === true,
        enumeration: ect["/freebase/type_hints/enumeration"] === true,
        included_types: ect["/freebase/type_hints/included_types"]
      }
    });
    var minimal = ph.minimal_prop_structure(schema, lang);
    if ("description" in structure) {
      minimal.description = structure.description;
    }
    if ("values" in structure) {
      minimal.values = structure.values;
    }
    //console.log(minimal, structure);
    same(minimal, structure);
  };

  [
    "/people/person/date_of_birth",
    "/people/person/height_meters",
    "/people/person/gender",
    "/people/person/nationality"

    // cvt
    // these need to be tested when topic api returns empty cvt properties
    //"/people/person/spouse_s",
    //"/people/person/sibling_s",
    //"/people/person/employment_history"
  ].forEach(function(pid) {
    (function() {
      var schema, structure, minimal;
      queries.prop_schema(pid, "/lang/en")
        .then(function(s) {
          schema = s;
        });
      acre.async.wait_on_results();
      ok(schema, "Got " + pid + " schema");
      structure = topic.properties[pid];
      test_minimal(schema, structure, "/lang/en");
    })();
  });
});

test("literal_validator", function() {
  var map = {
    "/type/datetime": validators.Timestamp,
    "/type/int": validators.Int,
    "/type/float": validators.Float,
    "/type/boolean": validators.StringBool,
    "/type/uri": validators.Uri,
    "/type/enumeration": validators.MqlKey
  };
  ["/type/int",
  "/type/float",
  "/type/boolean",
  "/type/rawstring",
  "/type/uri",
  "/type/text",
  "/type/datetime",
  "/type/id",
  "/type/key",
  "/type/value",
  "/type/enumeration"].forEach(function(t) {
    if (map[t]) {
      strictEqual(ph.literal_validator(t), map[t]);
    }
    else {
      strictEqual(ph.literal_validator(t), validators.String);
    }
  });
});

test("mqlwrite_clause /common/topic/alias", function() {
  var lang = "/lang/en";
  var alias;
  get_prop_structure("/common/topic/alias", lang)
    .then(function(ps) {
      alias = ps;
    });
  acre.async.wait_on_results();
  ok(alias, "Got /common/topic/alias");
  try {
    ph.mqlwrite_clause(alias, {}, lang);
    ok(false, "expected invalid params");
  }
  catch (e if e instanceof validators.Invalid) {
    ok(true, "got expected invalid: " + e);
  }
  catch (e) {
    ok(false, "got unxpected exception: " + e);
  }
  same(ph.mqlwrite_clause(alias, {"/common/topic/alias": "alias"}, lang),
       [{value:"alias", lang:lang, connect:"insert"}]);

  same(ph.mqlwrite_clause(alias, {"/common/topic/alias": ["alias1", "alias2", "alias3"]}, lang),
       [{value:"alias1", lang:lang, connect:"insert"},
        {value:"alias2", lang:lang, connect:"insert"},
        {value:"alias3", lang:lang, connect:"insert"}]);
});

test("mqlwrite_clause /people/person/date_of_birth", function() {
  var lang = "/lang/en";
  var dob;
  get_prop_structure("/people/person/date_of_birth", lang)
    .then(function(ps) {
      dob = ps;
    });
  acre.async.wait_on_results();
  ok(dob, "Got /people/person/date_of_birth");
  try {
    ph.mqlwrite_clause(dob, {"/people/person/date_of_birth": "dob"}, lang);
    ok(false, "expected invalid datetime");
  }
  catch (e if e instanceof validators.Invalid) {
    ok(true, "got expected invalid: " + e);
  }
  catch (e) {
    ok(false, "got unxpected exception: " + e);
  }

  same(ph.mqlwrite_clause(dob, {"/people/person/date_of_birth": ["2006"]}, lang),
       [{value:"2006", connect:"update"}]);

  try {
    ph.mqlwrite_clause(dob, {"/people/person/date_of_birth": ["2006", "2007"]}, lang);
    ok(false, "expected invalid params");
  }
  catch (e if e instanceof validators.Invalid) {
    ok(true, "got expected invalid: " + e);
  }
  catch (e) {
    ok(false, "got unxpected exception: " + e);
  }
});

test("mqlwrite_clause /people/person/nationality", function() {
  var lang = "/lang/en";
  var nationality;
  get_prop_structure("/people/person/nationality", lang)
    .then(function(ps) {
      nationality = ps;
    });
  acre.async.wait_on_results();
  ok(nationality, "Got /people/person/nationality");
  var expected = [{
    id: "/en/united_states",
    connect: "insert"
  }, {
    id: "/en/mexico",
    connect: "insert"
  }];
  expected.forEach(function(o) {
    o.type = [{id:nationality.expected_type.id, connect:"insert"}];
    nationality.expected_type.included_types.forEach(function(t) {
      o.type.push({id:t, connect:"insert"});
    });
  });
  same(ph.mqlwrite_clause(nationality, {
    "/people/person/nationality": ["/en/united_states", "/en/mexico"]
  }, lang), expected);
});

test("mqlwrite_object /people/person/height_meters", function() {
  var lang = "/lang/en";
  var height;
  get_prop_structure("/people/person/height_meters", lang)
    .then(function(ps) {
      height = ps;
    });
  acre.async.wait_on_results();
  ok(height, "Got /people/person/height_meters");
  var expected = {
    id: "/subject/id",
    "/people/person/height_meters": [{
      value: 1.7,
      connect: "update"
    }]
  };
  same(ph.mqlwrite_object("/subject/id", height, {"/people/person/height_meters": "1.7"}, lang),
       expected);
});

test("mqlwrite_object /film/film/directed_by", function() {
  var lang = "/lang/en";
  var directed_by;
  get_prop_structure("/film/film/directed_by", lang)
    .then(function(ps) {
      directed_by = ps;
    });
  acre.async.wait_on_results();
  ok(directed_by, "Got /film/film/directed_by");
  var expected = {
    id: "/film/id",
    "/film/film/directed_by": [{
      id: "/director/1",
      connect: "insert"
    }, {
      id: "/director/2",
      connect: "insert"
    }]
  };
  expected["/film/film/directed_by"].forEach(function(o) {
    o.type = [{id:directed_by.expected_type.id, connect:"insert"}];
    directed_by.expected_type.included_types.forEach(function(t) {
      o.type.push({id:t, connect:"insert"});
    });
  });
  var params = {
    "/film/film/directed_by": ["/director/1", "/director/2"]
  };
  same(ph.mqlwrite_object("/film/id", directed_by, params, lang), expected);
  same(ph.mqlwrite_query("/film/id", directed_by, params, lang), expected);
});

test("mqlwrite_cvt /film/film/starring", function() {
  var lang = "/lang/en";
  var starring;
  get_prop_structure("/film/film/starring", lang)
    .then(function(ps) {
      starring = ps;
    });
  acre.async.wait_on_results();
  ok(starring, "Got /film/film/starring");

  var expected = {
    id: "/film/id",
    "/film/film/starring": [{
      id: null,
      type: [{id: starring.expected_type.id}],
      create: "unconditional",
      connect: "insert",
      "/film/performance/actor": [{
        id: "/actor/id",
        connect: "update"
      }],
      "/film/performance/character": [{
        id: "/character/id",
        connect: "update"
      }],
      "/film/performance/special_performance_type": [{
        id: "/performance/1",
        connect: "insert"
      },{
        id: "/performance/2",
        connect: "insert"
      }]
    }]
  };
  var clause = expected["/film/film/starring"][0];
  starring.properties.forEach(function(p) {
    if (clause[p.id]) {
      clause[p.id].forEach(function(o) {
        o.type = [{id:p.expected_type.id, connect:"insert"}];
        p.expected_type.included_types.forEach(function(t) {
          o.type.push({id:t, connect:"insert"});
        });
      });
    }
  });
  var params = {
    "/film/performance/actor": "/actor/id",
    "/film/performance/character": "/character/id",
    "/film/performance/special_performance_type": ["/performance/1", "/performance/2"]
  };
  same(ph.mqlwrite_cvt("/film/id", starring, params, lang), expected);
  same(ph.mqlwrite_query("/film/id", starring, params, lang), expected);
});

function get_prop_structure(pid, lang) {
  return queries.prop_structure(pid, lang);
};

acre.test.report();
