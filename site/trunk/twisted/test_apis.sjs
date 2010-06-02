acre.require('/test/lib').enable(this);

var freebase = acre.require("apis").freebase;
var urlfetch = acre.require("apis").urlfetch;

test("urlfetch_success", function() {
  // Basic url fetch should call the callback
  var d = urlfetch("http://www.freebase.com");
  d.addCallback(function(result) {
    ok(result.body, "Make sure that we returned a result");
  })
  d.addErrback(function(error) {
    ok(false, "Urlfetch returned an error: "+error);
  });
  
  acre.async.wait_on_results();
  
  // Multiple urlfetches should also work
  var d = urlfetch("http://www.metaweb.com");
  d.addCallback(function(result) {
    ok(result.body, "Make sure that we returned a result");
  })
  d.addErrback(function(error) {
    ok(false, "Urlfetch returned an error: "+error);
  });
  
  acre.async.wait_on_results();
});

test("urlfetch_redirects", function() {
  // Make sure that we are following redirects on async urlfetchs
  
  var d = urlfetch("http://freebase.com");
  d.addCallback(function(result) {
    ok(result.body, "Make sure that we returned a result");
  })
  d.addErrback(function(error) {
    if (error.info.status >= 300 && error.info.status < 400) {
      ok(false, "We should have redirected and not received this error.");
    } else {
      ok(false, "We shouldn't be erroring out here");
    }
  });
  
  acre.async.wait_on_results();
});

test("urlfetch_failure", function() {
  // Check that a 404 response calls the errback
  
  var errback_called = false;
  var d = urlfetch("http://www.freebase.com/non-existent-page");
  d.addCallback(function(result) {
    ok(false, "Callback shouldn't have run on a 404 response.");
  })
  d.addErrback(function(error) {
    equals(error.info.status, 404);
    errback_called = true;
  });
  acre.async.wait_on_results();
  ok(errback_called, "Errback must be called on failed requests");
  
  // Check that bad urls call the errback
  var errback_called = false;
  var d = urlfetch("bad_url");
  d.addCallback(function(result) {
    ok(false, "Callback shouldn't have run on a bad url.");
  })
  d.addErrback(function(error) {
    errback_called = true;
  });
  
  acre.async.wait_on_results();
  ok(errback_called, "Errback must be called on failed requests");
  
});

if (acre.current_script === acre.request.script) {
  acre.test.report();
}
