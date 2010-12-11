var mf = acre.require("MANIFEST").mf;
var apis = mf.require("promise", "apis");
var extend = mf.require("core", "helpers").extend;

var self = this;

function record(scope) {
  // Override async urlfetch
  var responses = [];
  var all_responses = {};

  var freebase_apis = apis.freebase;
  for(var api_name in freebase_apis) {
    (function() {
      var api = apis.freebase[api_name];
      apis.freebase[api_name] = function() {
        var p = api.apply(this, arguments)
          .then(function(response) {
            responses.push(response);
            return response;
          }, function (error) {
            responses.push(error);
            return error;
          });
        acre.async.wait_on_results();
        return p;
      };
    })();
  }

  var urlfetch = apis.urlfetch;
  apis.urlfetch = function() {
    var p = urlfetch.apply(this, arguments)
      .then(function(response) {
        responses.push(response);
        return response;
      }, function (error) {
        responses.push(error);
        return error;
      });
    acre.async.wait_on_results();
    return p;
  };

  // Override test
  var acre_test = scope.test;
  scope.test = function(name) {
    responses.length = 0;
    acre_test.apply(scope, arguments);
    all_responses[name] = [].concat(responses);
  };

  var acre_test_report = scope.acre.test.report;
  scope.acre.test.report = function(name) {
//    acre_test_report.apply(scope, arguments);
    acre.write(JSON.stringify(all_responses));
  };
}

function playback(scope, playback_file) {
  var test_responses = JSON.parse(scope.acre.require(playback_file).body);

  var test_info;

  var freebase_apis = apis.freebase;
  for(var api_name in freebase_apis) {
    (function() {
       var api = apis.freebase[api_name];
       apis.freebase[api_name] = function() {
         var responses = test_responses[test_info.name];
         var response = responses[test_info.index++];
         return deferred.resolved(response);
       };
     })();
  }

  var urlfetch = apis.urlfetch;
  apis.urlfetch = function() {
    var responses = test_responses[test_info.name];
    var response = responses[test_info.index++];
    return deferred.resolved(response);
  };


  var acre_test = scope.test;
  scope.test = function(name) {
    test_info = {name:name, index:0};
    acre_test.apply(scope, arguments);
  };
}
