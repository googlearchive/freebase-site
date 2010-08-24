acre.require('/test/lib').enable(this);

var q = acre.require("queries");
var mql = acre.require("mql");



test("incoming_from_domain", function() {
  var result;
  q.incoming_from_domain("/film/film", "/film")
    .then(function(props) {
      result = props;
    });
  acre.async.wait_on_results();
  ok(result && (result instanceof Array));

  // check all prop ids start with /film/
  var errors = [];
  result.forEach(function(p) {
    if (p.id.indexOf("/film/") !== 0) {
      errors.push(p.id);
    }
  });
  ok(!errors.length, errors.join(","));
});

test("incoming_from_domain count", function() {
  var result;
  q.incoming_from_domain("/film/film", "/film", true)
    .then(function(props) {
      result = props;
    });
  acre.async.wait_on_results();
  ok(typeof result === "number", ""+result);
});

test("incoming_from_commons", function() {
  var result;
  q.incoming_from_commons("/film/film", "/film")
    .then(function(props) {
      result = props;
    });
  acre.async.wait_on_results();
  ok(result && (result instanceof Array));

  // check all prop ids are NOT /film/... since we're excluding it
  var errors = [];
  result.forEach(function(p) {
    if (p.id.indexOf("/film/") === 0) {
      errors.push(p.id);
    }
  });
  ok(!errors.length, errors.join(","));
});

test("incoming_from_commons count", function() {
  var result;
  q.incoming_from_commons("/film/film", "/film", true)
    .then(function(props) {
      result = props;
    });
  acre.async.wait_on_results();
  ok(typeof result === "number", ""+result);
});

test("incoming_from_bases", function() {
  var result;
  q.incoming_from_bases("/base/truereligion/jeans", "/base/truereligion")
    .then(function(props) {
      result = props;
    });
  acre.async.wait_on_results();
  ok(result && (result instanceof Array));

  // check all prop ids are NOT /base/truereligion/... since we're excluding it
  var errors = [];
  result.forEach(function(p) {
    if (p.id.indexOf("/base/truereligion/") === 0) {
      errors.push(p.id);
    }
  });
  ok(!errors.length, errors.join(","));
});

test("incoming_from_bases count", function() {
  var result;
  q.incoming_from_commons("/base/slamdunk/player", "/base/slamdunk", true)
    .then(function(props) {
      result = props;
    });
  acre.async.wait_on_results();
  ok(typeof result === "number", ""+result);
});

acre.test.report();

