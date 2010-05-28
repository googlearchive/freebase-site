var Urlfetch;
var freebase = {};

function() {
  var defer = acre.require("defer");
  
  Urlfetch = defer.makeDeferred(
    acre.async.urlfetch,
    {position:1, key:"callback"},
    {position:1, key:"errback"}
  );
  
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
}