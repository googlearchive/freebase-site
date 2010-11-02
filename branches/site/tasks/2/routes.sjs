var service = acre.require("/freebase/libs/service/lib", "release");
   
/**
 * GET /tasks/12345 - get info on the task
 * 
 * DELETE /tasks/12345 - delete the task
 * 
 * POST/PUT /tasks/ - creates a task
 * 
 * POST/PUT /tasks/12345/projects/12356 - add a project
 * 
 * DELETE /tasks/12345/projects/12346
 */

var HEADER_METHOD_OVERRIDE = "X-Method-Override";

function _get_method(){
  var method_override = acre.request.headers[HEADER_METHOD_OVERRIDE];
  return method_override || acre.request.method;
}


/*
 * Parses the path_info segment of a url into a array of key-value pairs.
 * 
 * Pairs are separated by "/-/", and within a kv pair, the key is the string up
 * till the first "/" and the value is the rest.
 * 
 * The exception to this is the first component, where the key "task" is 
 * implicit so that "/12345" yields the pair["task", "/12345"].
 
 * eg.
 *    the path_info: "/12345/-/domain/en/film"
 * 
 *    would yield [["task","/12345"], ["domain", "/en/film"]  ]
 */
function _get_params(path_info){
  console.log("PATH_INFO:" + path_info);
  var components = path_info.split("/-/");
  if (!components.length){
    return [];
  }


  // the first part is always the task id
  var params = [ ["task", components[0]] ];


  if (components.length > 1){
      for (var x = 1; x < components.length; x+=1){
        var component  = components[x];
        console.log("COMP: " + component );
        var sep = component.indexOf("/");
        sep = sep != -1 ? sep : component.length +1;
        var key = component.slice(0,sep);
        console.log("key: " + key);
        var value = component.slice(sep);

        //if it's just a slash, the value is empty
        value = value.length == 1 ? null : value;

        console.log("value: " + value);
        params.push([key, value || null ]);
      }
  }

  console.log("params: " + params);
  return params;
}

function _params_list_to_params_map(params_list){
  var param_map = {};
  for (var x = 0; x < params_list.length; x++){
    var kv_pair = params_list[x];
    param_map[kv_pair[0]] = kv_pair[1];
  }
  return param_map;
}

function handle_get(params){
  console.log("entering handle_get");
  var params_map = _params_list_to_params_map(params);
  var task_id = params_map.task;
  var mql_result = acre.freebase.mqlread({
      "id": task_id,
      "type": "/freebase/task",
      "!/freebase/domain_profile/task":[{
          "id":null, 
           "optional":true
      }],
      "active":null,
      "successful":null,
      "app":{
        "id":null,
        "optional":true
      },
      "queue":null,
      "mdo":{
        "id":null,
        "optional":true
      },
      "name":null
  });
  
  console.log("mql result: " + JSON.stringify(mql_result));
  if (!mql_result.result){
    throw new service.ServiceError(404, "/api/status/error", {
        "message":"no such task"
    });
  }
  
}

function handle_put(path_params, query_params){
  var user = service.check_user();
  

}

if (acre.current_script === acre.request.script) {

  // This is a hack so that we can make sure tests can run by hitting this url
  if (acre.request.path_info.indexOf("/test_") == 0 || acre.request.path_info.indexOf("/MANIFEST") == 0 ){
    acre.route(acre.request.url);
  }

  var method = _get_method();
  var base_url = acre.request.base_url;
  var params = _get_params(acre.request.path_info);  
  var result = null;
  
  service.FormService(function(){
  if (method == "GET"){
    result  = handle_get(params);
    
  } else if (method =="POST"){
    result = handle_post(params);
  } else if (method == "PUT"){
    result = handle_put(params);
  }

  }, this);
}