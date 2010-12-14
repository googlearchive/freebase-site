var mf = acre.require("MANIFEST").mf;
var apis = mf.require("promise", "apis");
var h = mf.require("core", "helpers");

var self = this;

function record(scope) {

  var test_data = [];
  var playback_data = {};

  function wrapper(api_name, api) {
    return function() {
      var args = arguments_array.apply(null, arguments);
      var p = api.apply(this, args)
        .then(function(response) {
                test_data.push([api_name, args, response]);
                return response;
              },
              function (error) {
                test_data.push([api_name, args, error]);
                return error;
              });
      acre.async.wait_on_results();
      return p;
    };
  };

  // Override async apis.freebase.* methods to record response
  var freebase_apis = apis.freebase;
  for (var api_name in freebase_apis) {
    (function() {
      var api = apis.freebase[api_name];
      apis.freebase[api_name] = wrapper("freebase." + api_name, api);
    })();
  }

  // Override async apis.urlfetch to record response
  var urlfetch = apis.urlfetch;
  apis.urlfetch = wrapper("urlfetch", urlfetch);

  // Override test() to reset response array
  var acre_test = scope.test;
  scope.test = function(name) {
    test_data.length = 0;
    acre_test.apply(scope, arguments);
    playback_data[name] = [].concat(test_data);
  };

  // Override acre.test.report() to serialize playback JSON
  var acre_test_report = scope.acre.test.report;
  scope.acre.test.report = function(name) {
    acre_test_report.apply(scope, arguments);
    acre.write(JSON.stringify(playback_data));
  };
}

function playback(scope, playback_file) {
  var playback_data = JSON.parse(scope.acre.require(playback_file).body);

  var test_info;

  function wrapper(api_name, api) {
    return function() {
      var test_data = playback_data[test_info.name];
      if (!test_data) {
        throw(h.sprintf("Playback data does not exist: %s", test_info.name));
      }
      var current;
      try {
        current = test_data[test_info.index++];
        if (!current) {
          throw(null);
        }
      }
      catch(ex) {
        throw(h.sprintf("Playback data IndexOutOfBoundsException: %s", ex));
      }
      var args = arguments_array.apply(null, arguments);

      var recorded_api_name = current[0];
      var recorded_args = current[1];
      var recorded_response = current[2];


      if (recorded_api_name !== api_name) {
        throw("Playback data mismatch api name: %s, expected: %s", api_name, recorded_api_name);
      }

      // TODO: assert api_args == recorded_args (deep equals)

      return deferred.resolved(recorded_response);
    };
  };


  // Override async apis.freebase.* methods to playback response
  var freebase_apis = apis.freebase;
  for(var api_name in freebase_apis) {
    (function() {
       var api = apis.freebase[api_name];
       apis.freebase[api_name] = wrapper("freebase." + api_name, api);
     })();
  }

  // Override async apis.urlfetch to playback response
  var urlfetch = apis.urlfetch;
  apis.urlfetch = wrapper("urlfetch", urlfetch);

  // Override test() to reset current playback response
  var acre_test = scope.test;
  scope.test = function(name) {
    test_info = {name:name, index:0};
    acre_test.apply(scope, arguments);
  };
}



function arguments_array() {
  var args = [];
  for (var i=0,l=arguments.length; i<l; i++) {
    args[i] = arguments[i];
  }
  return args;
};
