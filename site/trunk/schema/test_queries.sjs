acre.require('/test/lib').enable(this);

var q = acre.require("queries");
var mql = acre.require("mql");

function assert_keys(keys, o, null_check) {
  var errors = [];
  keys.forEach(function(key) {
    if (! (key in o)) {
      errors.push(key);
    }
    if (null_check && o[key] == null) {
      errors.push(key + " null");
    }
  });
  if (errors.length) {
    ok(false, JSON.stringify(errors));
  }
  else {
    ok(true, JSON.stringify(keys));
  }
};

function assert_domain(domain) {
  assert_keys(["id", "name", "types", "instance_count"], domain, true);
};

test("domains", function() {
  var result;
  q.domains(mql.domains({"id":"/base/slamdunk",key:[]}))
    .then(function(domains) {
       result = domains;
    });
  acre.async.wait_on_results();
  ok(result);
  ok(result.length === 1);
  result = result[0];
  equal(result.id, "/base/slamdunk");
  assert_domain(result);
});

test("common_domains", function() {
  var result;
  q.common_domains()
    .then(function(domains) {
      result = domains;
    });
  acre.async.wait_on_results();
  ok(result);
  ok(result.length);
  result.forEach(function(domain) {
    assert_domain(domain);
  });
});

test("user_domains", function() {
  var result;
  q.user_domains("/user/daepark")
    .then(function(domains) {
      result = domains;
    });
  acre.async.wait_on_results();
  ok(result);
  ok(result.length);
  var slamdunk_base;
  result.forEach(function(domain) {
    assert_domain(domain);
    if (domain.id === "/base/slamdunk") {
      slamdunk_base = domain;
    }
  });
  ok(slamdunk_base);
});


test("domain", function() {
  function assert_type(type, cvt) {
    assert_keys(["name", "id", "properties", "instance_count", "blurb", "mediator"], type, true);
    equal(type["mediator"], cvt);
  };

  var result;
  q.domain("/base/slamdunk")
    .then(function(d) {
      result = d;
    });
  acre.async.wait_on_results();
  ok(result);
  assert_keys(["id", "name", "creator",  "owners", "timestamp", "date",
               "blurb", "blob", "types", "cvt:types"], result, true);
  // regular types
  ok(result.types && result.types.length);
  result.types.forEach(function(type) {
    assert_type(type, false);
  });
  // cvts
  var cvts = result["cvt:types"];
  if (cvts && cvts.length) {
    cvts.forEach(function(cvt) {
      assert_type(cvt, true);
    });
  }
});

function assert_prop(prop) {
  assert_keys(["id", "name", "expected_type",
               "tip", "disambiguator", "display_none"], prop, true);
  assert_keys(["unique", "unit", "master_property", "reverse_property"], prop);
  if (prop.expected_type && typeof prop.expected_type === "object") {
    assert_keys(["mediator"], prop.expected_type);
  }
}

function assert_type(type) {
  assert_keys(["id", "name", "domain",
               "mediator", "enumeration", "included_types",
               "creator", "timestamp", "date",
               "blurb", "blob",
               "instance_count",
               "properties"], type);
  if (type.properties && type.properties.length) {
    type.properties.forEach(function(p) {
      assert_prop(p);
    });
  }
};

test("base_type", function() {
  var result;
  q.base_type("/base/slamdunk/player")
    .then(function(t) {
      result = t;
    });
  acre.async.wait_on_results();
  ok(result);
  assert_type(result);
});

test("type", function() {
  var result;
  q.type("/base/slamdunk/player")
    .then(function(t) {
      result = t;
    });
  acre.async.wait_on_results();
  ok(result);
  assert_type(result);
  ok(result.incoming);
  assert_keys(["same", "common", "base"], result.incoming);
});

test("typediagram", function() {
  var result;
  q.typediagram("/base/slamdunk/player")
    .then(function(t) {
      result = t;
    });
  acre.async.wait_on_results();
  ok(result);
  assert_type(result);
  ok(result.incoming);
  assert_keys(["same", "common", "base"], result.incoming);
});


test("property", function() {
  var result;
  q.property("/film/film/starring")
    .then(function(p) {
      result = p;
    });
  acre.async.wait_on_results();
  ok(result);
  assert_prop(result);
});


test("property.incoming", function() {
  var result;
  q.property.incoming("/film/director")
    .then(function(props) {
      result = props;
    });
  acre.async.wait_on_results();
  ok(result);
  result.forEach(function(prop) {
    assert_prop(prop);
  });
});


acre.test.report();

