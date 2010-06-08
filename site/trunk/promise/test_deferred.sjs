acre.require('/test/lib').enable(this);

var deferred = acre.require("deferred");

test("callback", function() {
  var value = 0;
  function add() {
    value += 1;
  }
  
  var d = deferred.unresolved()
  var p = d.then(add);
  // The callback shouldn't have run yet
  equals(value, 0);
  // We are now calling the callback so the number should go up by one
  d.resolve()
  equals(value, 1);
  // Enqueing a new callback after the deferred has been resolved
  //  should result in the callback being called
  p = p.then(add);
  equals(value, 2);
});

test("callback_chaining", function() {
  var p = deferred.resolved("horse");
  
  // Each return result should be passed along to
  //  the next callback...
  p.then(function(result) {
    equals(result, "horse");
    return "chicken";
  })
  .then(function(result) {
    equals(result, "chicken");
    return 0;
  })
  .then(function(result) {
    equals(result, 0);
  });
  
  // ...while not affecting the original
  p.then(function(result) {
    equals(result, "horse");
  })
});

test("callback_deferred", function() {
  var p = deferred.resolved("ministry of");
  
  // Each result should be the result of the deferred
  //  before it in the chain
  p.then(function(result) {
    equals(result, "ministry of");
    return deferred.resolved("silly")
  })
  .then(function(result) {
    equals(result, "silly");
    return deferred.rejected("walks")
  })
  .then(null, function(error) {
    equals(error.message, "walks");
  });
});

test("errback", function() {
  var value = 0;
  
  function err() {
    n/a;
  }
  function add() {
    value += 1;
  }
  function sub() {
    value -= 1;
  }
  function not_handled(e) {
    throw e;
  }
  
  var d = deferred.unresolved();
  
  var p = d.then(err).then(null, sub);
  // Neither callback nor errrback should have been triggered
  equals(value, 0);
  // We are now calling the callback
  // so we should error and the number should go to -1
  d.resolve(0)
  equals(value, -1);
  // Since we recovered gracefully we should be back
  //  to callbacks
  p = p.then(add);
  equals(value, 0);
  
  // If we don't handle the error with the first callback then
  //   we should still be calling errbacks
  p = p.then(err);
  p = p.then(not_handled);
  // Still should be in error
  p = p.then(add);
  equals(value, 0);
  p = p.then(null, sub);
  equals(value, -1);
  p = p.then(add);
  equals(value, 0);
});

test("errback_late_trigger", function() {
  // Lets try that again this time triggering the callback last
  var value = 0;
  function err() {
    n/a;
  }
  function add() {
    value += 1;
  }
  function sub() {
    value -= 1;
  }
  function not_handled(e) {
    throw e;
  }
  
  var d = deferred.unresolved()
  d.then(err) // 0
    .then(null, sub) // -1
    .then(add); // 0
  d.resolve()
  equals(value, 0);
  
  // If we don't handle the error with the first callback then
  //   we should still be calling errbacks
  var d = deferred.unresolved()
  d.then(err) // 0
    .then(null, not_handled) // 0 - Should keep us in errbacks
    .then(add) // 0 - Should be skipped
    .then(null, sub); // -1
  d.resolve()
  equals(value, -1);
  
});

test("quick_trigger", function() {
  var value = 0;
  function add() {
    value += 1;
    return value;
  }
  var p = deferred.unresolved().resolve();
  // We are triggering without a callback
  //  so the number should remain at 0
  equals(value, 0);
  
  // Now add a callback which should get immediately
  // triggered and increase the number to 1
  p.then(add);
  equals(value, 1);
  
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
  
  var d = deferred.unresolved();
  var p = d.then(err);
  d.resolve();
  // The errback shouldn't have run yet
  equals(value, 0);
  // We are now adding the errback
  // so the number should go down by one
  p.then(null, sub)
  equals(value, -1);
});

test("succeed_and_fail", function() {
  var d = deferred.resolved("success");
  var callback_called = false;
  var p = d.then(null, function(error) {
    ok(false, "Shouldn't call errback on success");
    throw error;
  });
  p = p.then(function(result) {
    equals(result, "success");
    callback_called = true;
    return result;
  });
  ok(callback_called, "Callback must have been called for succeed");
  
  var error = new Error("error");
  var d = deferred.rejected(error);
  var errback_called = false;
  var p = d.then(null, function(e) {
    equals(e, error);
    errback_called = true;
    throw e;
  });
  p = p.then(function(result) {
    ok(false, "Shouldn't call callback on error");
    return result;
  });
  ok(errback_called, "Errback must have been called for fail");
});

if (acre.current_script === acre.request.script) {
  acre.test.report();
}