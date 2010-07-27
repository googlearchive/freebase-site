var urlfetch;
var freebase = {};

(function() {
  var deferred = acre.require("deferred");

  urlfetch = function() {
    // Wrap async urlfetch to handle redirects
    var _urlfetch = deferred.makePromise(
      acre.async.urlfetch,
      {position:1, key:"callback"},
      {position:1, key:"errback"}
    );

    var args = Array.prototype.slice.call(arguments);

    var handle_redirect_error = function(error) {
      // Not a urlfetch exception, so let someone else handle it
      if (!(error instanceof acre.errors.URLError)) {
        throw error;
      }

      // Not a redirect, let someone else handle it
      if (error.info.status < 300 || error.info.status > 399) {
        throw error;
      }

      // Invalid redirect so we can't redirect
      if (!error.info.headers['Location'] || !error.info.headers['Location'].length) {
        throw error;
      }

      // Lets try this again, this time with the new url
      args[0] = error.info.headers['Location'];
      return _urlfetch.apply(null, args);
    };

    var handle_timeout_error = function(error) {
      if (error.message === "Time limit exceeded") {
        throw new deferred.RequestTimeout(error.message);
      }
      return error;
    }

    return _urlfetch.apply(null, args)
      .then(null, handle_redirect_error)
      .then(null, handle_timeout_error);
  };

  freebase.get_static = function(bdb, ids) {
    var retrieve_ids;

    if (!(ids instanceof Array)) {
      retrieve_ids = [ids];
    } else {
      retrieve_ids = ids;
    }

    var url = acre.freebase.service_url;
    url += "/api/trans/"+bdb+"?";
    retrieve_ids.forEach(function(id, i) {
      url += (i ? "&" : "") +  "id="+ id;
    });

    return urlfetch(url)
      .then(function(response) {
        var response = JSON.parse(response.body);
        var results = {};
        retrieve_ids.forEach(function (id) {
          results[id] = response[id].result;
        });
        return results;
      })
      .then(function(results) {
        if (!(ids instanceof Array)) {
          return results[ids];
        } else {
          return results;
        }
      });
  }

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
      freebase[api.name] = deferred.makePromise(
          acre.freebase[api.name],
          {position:api["options_pos"], key:"callback"},
          {position:api["options_pos"], key:"errback"}
      );
  });
})();
