acre.require('/test/lib').enable(this);

var defer = acre.require("defer");

test("callback", function() {
  function add(value) {
    return value + 1;
  }
  var d = defer.Deferred().addCallback(add);
  // The callback shouldn't have run yet
  equals(d.result, undefined);
  // We are now calling the callback so the number should go up by one
  d.callback(0)
  equals(d.result, 1);
  // Enqueing a new callback after the deferred has been triggered
  //  should result in the callback being called
  d.addCallback(add);
  equals(d.result, 2);
});

test("errback", function() {
  function err(value) {
    n/a;
  }
  function reset(error, value) {
    return value;
  }
  function add(value) {
    return value + 1;
  }
  function sub(value) {
    return value - 1;
  }
  function not_handled(e) {
    throw e;
  }

  var d = defer.Deferred().addCallback(err).addErrback(reset, -1);
  // The errback or callback shouldn't have run yet
  equals(d.result, undefined);
  // We are now calling the callback
  // so we should error and the number should go to -1
  d.callback(0)
  equals(d.result, -1);
  // Since we recovered gracefully we should be back
  //  to callbacks
  d.addCallback(add);
  equals(d.result, 0);

  // If we don't handle the error with the first callback then
  //   we should still be calling errbacks
  equals(d.result instanceof Error, false, "Shouldn't be in error: "+d.result);
  d.addCallback(err);
  equals(d.result instanceof Error, true, "Should be in error: "+d.result);
  d.addErrback(not_handled);
  equals(d.result instanceof Error, true, "Should be in error: "+d.result);
  d.addCallback(add);
  equals(d.result instanceof Error, true, "Should be in error: "+d.result);
  d.addErrback(reset, 0);
  equals(d.result instanceof Error, false, "Shouldn't be in error: "+d.result);
  d.addCallback(sub)
  equals(d.result, -1);
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

test("quick_trigger", function() {
  var value = 0;
  function add() {
    value += 1;
    return value;
  }
  var d = defer.Deferred().callback();
  // We are triggering without a callback
  //  so the number should remain at 0
  equals(value, 0);

  // Now add a callback which should get immediately
  // triggered and increase the number to 1
  d.addCallback(add);
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

  var d = defer.Deferred().addCallback(err).callback();
  // The errback shouldn't have run yet
  equals(value, 0);
  // We are now adding the errback
  // so the number should go down by one
  d.addErrback(sub)
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
    return 0;
  });
  d.addCallback(function(result) {
    equals(result, 0);
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

test("succeed_and_fail", function() {
  var d = defer.succeed("success");
  var callback_called = false;
  d.addErrback(function(error) {
    ok(false, "Shouldn't call errback on success");
    throw error;
  });
  d.addCallback(function(result) {
    equals(result, "success");
    callback_called = true;
    return result;
  });
  ok(callback_called, "Callback must have been called for succeed");

  var error = new Error("error");
  var d = defer.fail(error);
  var errback_called = false;
  d.addErrback(function(e) {
    equals(e, error);
    errback_called = true;
    throw e;
  });
  d.addCallback(function(result) {
    ok(false, "Shouldn't call callback on error");
    return result;
  });
  ok(errback_called, "Errback must have been called for fail");
});

test("deferred_list", function() {
  var called = {};

  var deferreds = [];
  for(var i=0; i<5; i++) {
    var d = defer.Deferred().callback(i);
    called[i] = false;
    d.addCallback(function(result) {
      called[result] = true;
      return result;
    });
    deferreds.push(d);
  }
  var d = defer.DeferredList(deferreds);

  var dlist_called = false;
  d.addCallback(function(results) {
    dlist_called = true;
    for(var i=0; i<5; i++) {
      var result = results[i];
      ok(called[result], "Result "+result+" should be called");
      equals(result, i, "Result "+result+" should be called in order");
    }
    return results;
  });

  d.addErrback(function(error) {
    ok(false, "The errback of a deferred list should never be called");
  });

  // Since all of the dependant callbacks were already triggered
  //  the dlist callback should be called immediately
  ok(dlist_called, "The callback for the deferred list should be called");
});

test("deferred_list_with_callbacks", function() {
  function steamer(word) {
    return ["steam", word].join("-");
  }

  var dengine = defer.Deferred().callback("engine").addCallback(steamer);
  var dpunk = defer.Deferred().addCallback(steamer).callback("punk");
  var dboat = defer.Deferred().addCallback(steamer);

  var dlist = defer.DeferredList([dengine, dpunk, dboat]);

  dboat.callback("boat");

  var dlist_called = false;
  dlist.addCallback(function(results) {
    dlist_called = true;
    equals(results[0], "steam-engine", "Should be the combined word");
    equals(results[1], "steam-punk", "Should be the combined word");
    equals(results[2], "steam-boat", "Should be the combined word");
    return results;
  });

  dlist.addErrback(function(error) {
    ok(false, "The errback of a deferred list should not be called");
  });

  // Since all of the dependant callbacks were already triggered
  //  the dlist callback should be called immediately
  ok(dlist_called, "The callback for the deferred list should be called");
});

test("deferred_list_error", function() {
  function err(value) {
    n/a;
  }
  function add(value) {
    return value + 1;
  }
  function sub(value) {
    return value - 1;
  }
  function not_handled(e) {
    throw e;
  }

  // Trigger the dependant callbacks
  var dsucc = defer.Deferred().callback(0).addCallback(add);
  var dfail = defer.Deferred().callback(0).addCallback(err);

  var d = defer.DeferredList([dsucc, dfail]);

  var dlist_called = false;
  d.addCallback(function([succ_result, fail_result]) {
    dlist_called = true;
    equals(succ_result, 1, "Should have been added");
    ok(fail_result instanceof Error, "Should have returned the error: "+fail_result);

    return [succ_result, fail_result];
  });

  d.addErrback(function(error) {
    ok(false, "The errback of a deferred list should not be called");
  });

  // Since all of the dependant callbacks were already triggered
  //  the dlist callback should be called
  ok(dlist_called, "The callback for the deferred list should be called");
});

test("deferred_dict", function() {
  var keys = ["a", "b", "c", "d", "e"];
  var called = {};

  var deferreds = {};
  for each(var key in keys) {
    var d = defer.Deferred().callback(key);
    called[key] = false;
    d.addCallback(function(result) {
      called[result] = true;
      return result;
    });
    deferreds[key] = d;
  }
  var d = defer.DeferredDict(deferreds);

  var ddict_called = false;
  d.addCallback(function(results) {
    ddict_called = true;
    for each(var key in keys) {
      var result = results[key];
      ok(called[result], "Result "+result+" should be called");
      equals(result, key, "Result "+result+" should be called with the correct key");
    }
    return results;
  });

  d.addErrback(function(error) {
    ok(false, "The errback of a deferred dict should never be called");
  });

  // Since all of the dependant callbacks were already triggered
  //  the dlist callback should be called immediately
  ok(ddict_called, "The callback for the deferred dict should be called");
});

acre.test.report();
