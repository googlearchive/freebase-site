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

var h = acre.require("helper/helpers.sjs");
var ph = acre.require("propbox/helpers.sjs");
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

test("mqlread_clause", function() {
  // /type/text
  var prop_structure = {
    id: "/prop/id",
    expected_type: {
      id: "/type/text"
    }
  };
  same(ph.mqlread_clause(prop_structure, null, "/lang/ko"), [{
    value: null,
    lang: null,
    "lang|=": ["/lang/ko", "/lang/en"],
    optional: true
  }]);
  same(ph.mqlread_clause(prop_structure, "korean name", "/lang/ko"), [{
    value: "korean name",
    lang: null,
    "lang|=": ["/lang/ko", "/lang/en"],
    optional: true
  }]);

  // /type/boolean
  prop_structure = {
    id: "/prop/id",
    expected_type: {
      id: "/type/boolean"
    },
    unique: true
  };
  same(ph.mqlread_clause(prop_structure, null, "/lang/ko"), [{
    value: null,
    optional: true
  }]);
  same(ph.mqlread_clause(prop_structure, false, "/lang/ko"), [{
    value: false,
    optional: true
  }]);

  //type/int
  prop_structure = {
    id: "/prop/id",
    expected_type: {
      id: "/type/int"
    }
  };
  same(ph.mqlread_clause(prop_structure, null, "/lang/ko"), [{
    value: null,
    optional: true
  }]);
  same(ph.mqlread_clause(prop_structure, 0, "/lang/ko"), [{
    value: 0,
    optional: true
  }]);

  // topic
  prop_structure = {
    id: "/prop/id",
    expected_type: {
      id: "/some/type"
    }
  };
  same(ph.mqlread_clause(prop_structure, null, "/lang/en"), [{
    id: null,
    name: [{
      value: null,
      lang: null,
      "lang|=": ["/lang/en"],
      optional: true
    }],
    optional: true
  }]);

  // mediator
  prop_structure = {
    id: "/prop/id",
    expected_type: {
      id: "/some/mediator",
      mediator: true
    },
    properties: [{
      id: "/subprop/1",
      expected_type: {
        id: "/type/text"
      }
    }, {
      id: "/subprop/2",
      expected_type: {
        id: "/some/type2"
      }
    }]
  };
  same(ph.mqlread_clause(prop_structure, null, "/lang/zh"), [{
    id: null,
    optional: true
  }]);
});

test("mqlread_query", function() {
  // /mediator
  var prop_structure = {
    id: "/prop/id",
    expected_type: {
      id: "/some/mediator",
      mediator: true
    },
    properties: [{
      id: "/subprop/1",
      expected_type: {
        id: "/type/text"
      }
    }, {
      id: "/subprop/2",
      expected_type: {
        id: "/some/type2"
      }
    }]
  };
  same(ph.mqlread_query("/en/foo", prop_structure, null, "/lang/iw"), {
    id: "/en/foo",
    "/prop/id": [{
      id: null,
      optional: true,
      "/subprop/1": [{
        value: null,
        lang: null,
        "lang|=": ["/lang/iw", "/lang/en"],
        optional: true
      }],
      "/subprop/2": [{
        id: null,
        name: [{
          value: null,
          lang: null,
          "lang|=": ["/lang/iw", "/lang/en"],
          optional: true
        }],
        optional: true
      }]
    }]
  });
  same(ph.mqlread_query("/en/foo", prop_structure, "/m/123", "/lang/iw"), {
    id: "/en/foo",
    "/prop/id": [{
      id: "/m/123",
      optional: true,
      "/subprop/1": [{
        value: null,
        lang: null,
        "lang|=": ["/lang/iw", "/lang/en"],
        optional: true
      }],
      "/subprop/2": [{
        id: null,
        name: [{
          value: null,
          lang: null,
          "lang|=": ["/lang/iw", "/lang/en"],
          optional: true
        }],
        optional: true
      }]
    }]
  });


  // deep property
  prop_structure = {
    id: "/prop/id",
    expected_type: {
      id: "/some/type"
    },
    properties: [{
      id: "/subprop/1",
      expected_type: {
        id: "/type/text"
      }
    }, {
      id: "/subprop/2",
      expected_type: {
        id: "/some/type2"
      },
      properties: [{
        id: "/deep/1",
        expected_type: {
          id: "/type/float"
        }
      }]
    }]
  };
  same(ph.mqlread_query("/en/foo", prop_structure, null, "/lang/en"), {
    id: "/en/foo",
    "/prop/id": [{
      id: null,
      name: [{
        value: null,
        lang: null,
        "lang|=": ["/lang/en"],
        optional: true
      }],
      optional: true,
      "/subprop/1": [{
        value: null,
        lang: null,
        "lang|=": ["/lang/en"],
        optional: true
      }],
      "/subprop/2": [{
        id: null,
        name: [{
          value: null,
          lang: null,
          "lang|=": ["/lang/en"],
          optional: true
        }],
        optional: true,
        "/deep/1": [{
          value: null,
          optional: true
        }]
      }]
    }]
  });
});


test("minimal_prop_value", function() {
  // topic
  var prop_structure = {
    id: "/some/prop/id",
    expected_type: {
      id: "/some/type/id"
    }
  };

  same(ph.minimal_prop_value(prop_structure, null, "/lang/en"), null);

  var prop_data = {
    id: "/some/topic/id",
    name: [{value:"ko name", lang:"/lang/ko"},{value:"en name", lang:"/lang/en"}]
  };
  same(ph.minimal_prop_value(prop_structure, prop_data, "/lang/ko"), {
    id: "/some/topic/id",
    text: "ko name",
    lang: "/lang/ko"
  });
  same(ph.minimal_prop_value(prop_structure, prop_data, "/lang/en"), {
    id: "/some/topic/id",
    text: "en name",
    lang: "/lang/en"
  });

  prop_data = {
    id: "/some/topic/id"
  };
  same(ph.minimal_prop_value(prop_structure, prop_data, "/lang/en"), {
    id: "/some/topic/id",
    text: "/some/topic/id"
  });

  prop_structure = {
    id: "/some/prop/id",
    expected_type: {
      id: "/type/text"
    }
  };
  prop_data = {
    value: "ko value",
    lang: "/lang/ko"
  };
  same(ph.minimal_prop_value(prop_structure, prop_data, "/lang/ko"), {
    value: "ko value",
    text: "ko value",
    lang: "/lang/ko"
  });

  prop_structure = {
    id: "/some/prop/id",
    expected_type: {
      id: "/type/int"
    }
  };
  prop_data = {
    value: 0
  };
  same(ph.minimal_prop_value(prop_structure, prop_data, "/lang/ko"), {
    value: 0,
    text: "0"
  });
});

acre.test.report();
