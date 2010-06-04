var urlfetch;
var freebase = {};

(function() {
  var defer = acre.require("defer");
  
  urlfetch = function() {
    // Wrap async urlfetch to handle redirects
    var _urlfetch = defer.makeDeferred(
      acre.async.urlfetch,
      {position:1, key:"callback"},
      {position:1, key:"errback"}
    );
    
    var args = Array.prototype.slice.call(arguments);
    var d = _urlfetch.apply(null, args);
    d.addErrback(function(failure) {
      // Not a urlfetch exception, so let someone else handle it
      if (!(failure.error instanceof acre.errors.URLError)) {
        throw failure;
      }
      
      // Not a redirect, let someone else handle it
      if (failure.error.info.status < 300 || failure.error.info.status > 399) {
        throw failure;
      }
      
      // Invalid redirect so we can't redirect
      if (!failure.error.info.headers['Location'] || !failure.error.info.headers['Location'].length) {
        throw failure;
      }
      
      // Lets try this again, this time with the new url
      args[0] = failure.error.info.headers['Location'];
      return _urlfetch.apply(null, args);
    });
    
    return d
  };
  
  var freebase_apis = [
      {name: "fetch",            options_pos: 1},
      {name: "touch",            options_pos: 0},
      {name: "get_user_info",    options_pos: 0},
      {name: "mqlread",          options_pos: 2},
      {name: "mqlread_multiple", options_pos: 2},
      {name: "mqlwrite",         options_pos: 2},
      {name: "upload",           options_pos: 2},
      {name: "create_group",     options_pos: 0},
      {name: "get_blob",         options_pos: 2},
      {name: "get_topic",        options_pos: 1},
      {name: "get_topic_multi",  options_pos: 1},
      {name: "search",           options_pos: 1},
      {name: "geosearch",        options_pos: 1}
  ];
  
  freebase_apis.forEach(function(api){
      freebase[api.name] = defer.makeDeferred(
          acre.freebase[api.name],
          {position:api["options_pos"], key:"callback"},
          {position:api["options_pos"], key:"errback"}
      );
  });
})();