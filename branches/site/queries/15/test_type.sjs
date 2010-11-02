acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").MF;
var type = mf.require("type");

test("included_types", function() {
  var result;
  type.included_types("/film/actor")
    .then(function(types) {
      result = types;
    });
  acre.async.wait_on_results();
  ok(result);
  var person = [t.id for each (t in result) if (t.id === "/people/person")];
  ok(person.length === 1, "/people/person is an included type of /film/actor");
});


acre.test.report();
