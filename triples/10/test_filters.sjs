acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").mf;
var f = mf.require("filters");
var h = mf.require("core", "helpers");

var tests;

test("get_history arg", function() {
  strictEqual(f.get_history(), null);
  strictEqual(f.get_history(null), null);
  [1, "1", true, "true", "yes", -1, "-1", "foo"].forEach(function(b) {
    strictEqual(f.get_history(b), true);
  });
  [0, "0", false, "false", "no"].forEach(function(b) {
    strictEqual(f.get_history(b), false);
  });
});

test("get_creator arg", function() {
  [null, "/user/foo", ["/user/bar", "/user/baz"]].forEach(function(u) {
    deepEqual(f.get_creator(u), u);
  });
  strictEqual(f.get_creator([]), null);
});

test("get_timestamp arg", function() {
  var ts;
  for (var key in f.TIMESTAMPS) {
    ts = f.get_timestamp(key);
    ok(ts, h.sprintf("%s: %s", key, ts));
  }
  ts = f.get_timestamp(["2009-10", "2010-10-14"]);
  equal(ts.length, 2, h.sprintf("%s to %s", ts[0], ts[1]));
});

tests = [
  1, 1,
  "1", 1,
  0, f.LIMIT,
  "-100", f.LIMIT,
  "200", 200,
  "foo", f.LIMIT
];
test("get_limit arg", tests, function() {
  for (var i=0,l=tests.length; i<l; i+=2) {
    strictEqual(f.get_limit(tests[i]), tests[i+1]);
  }
});

test("get_filters", function() {
  var args = {
    limit: "500",
    timestamp: "today",
    creator: ["/user/foo", "/user/bar"],
    as_of_time: "2010",
    history: "1",
    property: "/type/object/name"
  };
  deepEqual(f.get_filters("/en/hello", args), {
    id: "/en/hello",
    limit: 500,
    timestamp: acre.freebase.date_to_iso(f.TIMESTAMPS.today()),
    creator: ["/user/foo", "/user/bar"],
    as_of_time: "2010",
    history: true,
    property: "/type/object/name"
  });
});

test("mqlread_options", function() {
  deepEqual(f.mqlread_options(), {});
  deepEqual(f.mqlread_options(null), {});
  deepEqual(f.mqlread_options({as_of_time:null}), {});
  deepEqual(f.mqlread_options({as_of_time:"2010"}), {as_of_time:"2010"});
});

test("apply null filters", function() {
  ["limit", "timestamp", "creator", "history"].forEach(function(k) {
    deepEqual(f["apply_" + k]({}), {});
    deepEqual(f["apply_" + k]({}, null), {});
  });
});

test("apply_limit filter", function() {
  deepEqual(f.apply_limit({}, 500), {limit:500});
});

test("apply_timestamp filter", function() {
  deepEqual(f.apply_timestamp({}, f.get_timestamp("today")), {
    "a:timestamp>=": acre.freebase.date_to_iso(f.TIMESTAMPS.today())
  });
  deepEqual(f.apply_timestamp({}, [f.get_timestamp("yesterday"), f.get_timestamp("today")]), {
    "a:timestamp>=": acre.freebase.date_to_iso(f.TIMESTAMPS.yesterday()),
    "b:timestamp<": acre.freebase.date_to_iso(f.TIMESTAMPS.today())
  });
});

test("apply_creator filter", function() {
  deepEqual(f.apply_creator({}, "/user/foo"), {"filter:creator":"/user/foo"});
  deepEqual(f.apply_creator({}, ["/user/foo", "/user/bar", "/user/baz"]), {
    "filter:creator": {
      "id|=": ["/user/foo", "/user/bar", "/user/baz"]
    }
  });
});

test("apply_history filter", function() {
  deepEqual(f.apply_history({}, false), {});
  deepEqual(f.apply_history({}, true), {valid:null, operation:null});
});

test("apply_domain filter", function() {
  deepEqual(f.apply_domain_type_property({}, "/my/domain"), {
    "filter:master_property": {
      schema: {
        domain:"/my/domain"
      }
    }
  });
  // for /type/namespace/keys we are actually showing the reverse /type/object/key
  deepEqual(f.apply_domain_type_property({master_property: "/type/namespace/keys"}, "/my/domain"), {
    master_property: "/type/namespace/keys",
    "filter:master_property": {
      reverse_property: {
        schema: {
          domain: "/my/domain"
        }
      }
    }
  });
});

test("apply_type filter", function() {
  deepEqual(f.apply_domain_type_property({}, null, "/my/type"), {
    "filter:master_property": {
      schema: "/my/type"
    }
  });
  // for /type/namespace/keys we are actually showing the reverse /type/object/key
  deepEqual(f.apply_domain_type_property({master_property: "/type/namespace/keys"}, null, "/my/type"), {
    master_property: "/type/namespace/keys",
    "filter:master_property": {
      reverse_property: {
        schema: "/my/type"
      }
    }
  });
});

test("apply_property filter", function() {
  deepEqual(f.apply_domain_type_property({}, null, null, "/my/property"), {
    "master_property": "/my/property"
  });
  // for /type/namespace/keys we are actually showing the reverse /type/object/key
  deepEqual(f.apply_domain_type_property({master_property: "/type/namespace/keys"}, null, null, "/my/property"), {
    master_property: "/type/namespace/keys",
    "filter:master_property": {
      reverse_property: "/my/property"
    }
  });
});

test("filter_url", function() {
  var args = {
    limit: "500",
    timestamp: "today",
    creator: ["/user/foo", "/user/bar"],
    as_of_time: "2010",
    history: "1",
    property: "/type/object/name"
  };
  var filters = f.get_filters("/foo", args);
  var url = f.filter_url(filters, "creator", "/user/baz");
  var params = h.extend({}, filters, {creator: "/user/baz"});
  delete params.id;
  equal(url, acre.form.build_url(h.url_for("triples", null, null, "/foo"), params));
});

test("remove_filter_url", function() {
  var base_url = h.url_for("triples", null, null, "/foo");
  equal(f.remove_filter_url({id:"/foo",limit:f.LIMIT, creator:"/user/foo"}, "creator"), base_url);
  equal(f.remove_filter_url({id:"/foo",creator:"/user/foo"}, "creator", "/user/foo"), base_url);
  equal(f.remove_filter_url({id:"/foo",creator:["/user/foo", "/user/bar"]}, "creator", "/user/foo"),
        acre.form.build_url(base_url, {creator:"/user/bar"}));
});

acre.test.report();

