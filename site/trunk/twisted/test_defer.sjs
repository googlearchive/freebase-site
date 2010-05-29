acre.require('/test/lib').enable(this);

var defer = acre.require("defer");

test("callback", function() {
  var value = 0;
  function add() {
    value += 1;
    return value;
  }
  var d = defer.Deferred().addCallback(add);
  // The callback shouldn't have run yet
  equals(value, 0);
  // We are now calling the callback so the number should go up by one
  d.callback()
  equals(value, 1);
  // Enqueing a new callback after the deferred has been triggered
  //  should result in the callback being called
  d.addCallback(add);
  equals(value, 2);
});

test("errback", function() {
  var value = 0;
  function err() {
    n/a;
  }
  function add() {
    value += 1;
    return value;
  }
  function sub() {
    value -= 1;
    return value;
  }
  function not_handled(e) {
    throw e;
  }
  
  var d = defer.Deferred().addCallback(err).addErrback(sub);
  // The errback shouldn't have run yet
  equals(value, 0);
  // We are now calling the callback
  // so we should error and the number should go down by one
  d.callback()
  equals(value, -1);
  // Since we recovered gracefully we should be back
  //  to callbacks
  d.addCallback(add);
  equals(value, 0);
  
  // If we don't handle the error with the first callback then
  //   we should still be calling errbacks
  equals(d.not_in_error, true);
  d.addCallback(err);
  equals(d.not_in_error, false);
  d.addErrback(not_handled);
  equals(d.not_in_error, false);
  d.addCallback(add);
  equals(d.not_in_error, false);
  d.addErrback(sub);
  equals(d.not_in_error, true);
  equals(value, -1);
});

test("errback_late_trigger", function() {
  // Lets try that again this time triggering the callback last
  var value = 0;
  function err() {
    n/a;
  }
  function add() {
    value += 1;
    return value;
  }
  function sub() {
    value -= 1;
    return value;
  }
  function not_handled(e) {
    throw e;
  }
  
  var d = defer.Deferred()
  d.addCallback(err) // 0
  d.addErrback(sub); // -1
  d.addCallback(add); // 0
  d.callback()
  equals(value, 0);
  
  // If we don't handle the error with the first callback then
  //   we should still be calling errbacks
  var d = defer.Deferred()
  d.addCallback(err); // 0
  d.addErrback(not_handled); // 0 - Should keep us in errbacks
  d.addCallback(add); // 0 - Should be skipped
  d.addErrback(sub); // -1
  d.callback()
  equals(value, -1);
});

test("chaining", function() {
  var d = defer.Deferred().callback("horse");
  d.addCallback(function(result) {
    equals(result, "horse");
    return "chicken";
  });
  d.addCallback(function(result) {
    equals(result, "chicken");
  });
});

test("callback_arguments", function() {
  var d = defer.Deferred().callback("time");
  
  d.addCallback(function(result, extra) {
    equals(result, "time");
    equals(extra, "flies");
    return result + " " + extra;
  }, "flies");
  
  d.addCallback(function(result) {
    equals(result, "time flies");
    var args = Array.prototype.slice.call(arguments);
    return args.join(" ");
  }, "like", "an", "arrow");
  
  d.addCallback(function(result) {
    equals(result, "time flies like an arrow");
  })
});


if (acre.current_script === acre.request.script) {
  acre.test.report();
}