
console.log("test_routes", acre);

acre.require('/test/lib').enable(this);

console.log("test_routes 2");

//var mf = acre.require("MANIFEST").MF;
console.log("test_routes 2.1");

console.log("test_routes 3");

test("map", function() {
  ok(true, "test success");
});

console.log("test_routes 4");

//if (acre.current_script == acre.request.script) {
  console.log("test_routes 5");
  acre.test.report();
//}

