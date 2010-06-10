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
  var p = d.promise;
  
  var p = p.then(err).then(null, sub);
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

test("all_list", function() {
  var called = {};

  var promises = [];
  for(var i=0; i<5; i++) {
    called[i] = false;
    var p = deferred.resolved(i).then(function(result) {
      called[result] = true;
      return result;
    });
    promises.push(p);
  }

  var dlist_called = false;
  deferred.all(promises)
    .then(function(results) {
      dlist_called = true;
      for(var i=0; i<5; i++) {
        var result = results[i];
        ok(called[result], "Result "+result+" should be called");
        equals(result, i, "Result "+result+" should be called in order");
      }
      return results;

    }, function(error) {
      ok(false, "The errback of a deferred list should never be called");
    });

  // Since all of the dependant callbacks were already triggered
  //  the dlist callback should be called immediately
  ok(dlist_called, "The callback for the deferred list should be called");

  // Resolving out of order should work
  var dsteam = deferred.unresolved();
  var dpunk = deferred.unresolved();
  var dlist_called = false;
  deferred.all([dsteam, dpunk])
    .then(function([steam, punk]) {
      equals(steam, "steam");
      equals(punk, "punk");
      return steam+punk;
    })
    .then(function(result) {
      dlist_called = true;
      equals(result, "steampunk");
    });

  dpunk.resolve("punk");
  dsteam.resolve("steam");

  ok(dlist_called, "The callback for the deferred list should be called");
});

test("all_list_with_callbacks", function() {
  function steamer(word) {
    return ["steam", word].join("-");
  }

  var pengine = deferred.resolved("engine").then(steamer);
  var dpunk = deferred.unresolved();
  var ppunk = dpunk.then(steamer);
  dpunk.resolve("punk");
  var dboat = deferred.unresolved()
  var pboat = dboat.then(steamer);

  var pall = deferred.all([pengine, ppunk, pboat]);

  dboat.resolve("boat");

  var pall_called = false;
  pall.then(function(results) {
    pall_called = true;
    equals(results[0], "steam-engine", "Should be the combined word");
    equals(results[1], "steam-punk", "Should be the combined word");
    equals(results[2], "steam-boat", "Should be the combined word");
    return results;
  });

  pall.then(null, function(error) {
    ok(false, "The errback of a deferred list should not be called");
  });

  // Since all of the dependant callbacks were already triggered
  //  the dlist callback should be called immediately
  ok(pall_called, "The callback for the deferred list should be called");
});

test("all_error", function() {
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
  var dsucc = deferred.resolved(0).then(add);
  var dfail = deferred.resolved(0).then(err);

  var p = deferred.all([dsucc, dfail]);

  var all_called = false;
  p = p.then(function([succ_result, fail_result]) {
    all_called = true;
    equals(succ_result, 1, "Should have been added");
    ok(fail_result instanceof Error, "Should have returned the error: "+fail_result);

    return [succ_result, fail_result];
  });

  p = p.then(null, function(error) {
    ok(false, "The errback of a deferred list should not be called");
  });

  // Since all of the dependant callbacks were already triggered
  //  the dlist callback should be called
  ok(all_called, "The callback for the deferred list should be called");
});

test("all_dict", function() {
  var keys = ["a", "b", "c", "d", "e"];
  var called = {};

  var promises = {};
  keys.forEach(function(key) {
    called[key] = false;
    var p = deferred.resolved(key)
      .then(function(result) {
        called[result] = true;
        return result;
      });
    promises[key] = p;
  });

  var all_dict_called = false;
  deferred.all(promises)
    .then(function(results) {
      all_dict_called = true;
      keys.forEach(function (key) {
        var result = results[key];
        ok(called[result], "Result "+result+" should be called");
        equals(result, key, "Result "+result+" should be called with the correct key");
      });
      return results;
    }, function(error) {
      ok(false, "The errback of a deferred dict should never be called");
    });

  // Since all of the dependant callbacks were already triggered
  //  the dlist callback should be called immediately
  ok(all_dict_called, "The callback for the deferred dict should be called");
});

test("any_list", function() {
  var deferreds = [];
  for(var i=0; i<5; i++) {
    deferreds.push(deferred.unresolved());
  }
  
  var dlist_called = 0;
  deferred.any(deferreds)
    .then(function (result) {
      dlist_called += 1;
      equals(result, 3);
    },function (error) {
      dlist_called += 1;
      ok(false, "The errback shouldn't be called");
    });
  
  // The first one should trigger the any callback
  //   the others should be ignored
  deferreds[3].resolve(3);
  deferreds[2].reject(2);
  deferreds[0].resolve(0);
  
  equals(dlist_called, 1, "The callback for the any list should be called once.");
});


acre.test.report();
