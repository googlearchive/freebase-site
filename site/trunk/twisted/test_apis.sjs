acre.require('/test/lib').enable(this);

var freebase = acre.require("apis").freebase;
var urlfetch = acre.require("apis").urlfetch;

test("urlfetch_success", function() {
  var d = urlfetch("http://www.freebase.com");
  d.addCallback(function(result) {
    ok(result.body);
  })
  d.addErrback(function(error) {
    ok(false, "Urlfetch returned an error: "+error);
  });
  
  acre.async.wait_on_results();
  
  var d = urlfetch("http://www.metaweb.com");
  d.addCallback(function(result) {
    ok(result.body);
  })
  d.addErrback(function(error) {
    ok(false, "Urlfetch returned an error: "+error);
  });
  
  acre.async.wait_on_results();
});

test("urlfetch_failure", function() {
  var errback_called = false;
  
  var d = urlfetch("http://______bad_url_____.badTLD");
  d.addCallback(function(result) {
    ok(false, "Callback shouldn't have run on a failed request.");
  })
  d.addErrback(function(error) {
    console.log(error);
    errback_called = true;
  });
  
  acre.async.wait_on_results();
  
  ok(errback_called, "Errback must be called on failed requests");
});

if (acre.current_script === acre.request.script) {
  acre.test.report();
}