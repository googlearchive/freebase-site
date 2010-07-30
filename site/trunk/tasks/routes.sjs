var service = acre.require("/freebase/libs/service/lib", "release");

/**
 * GET /tasks/12345 - get info on the task
 * 
 * DELETE /tasks/12345 - delete the task
 * 
 * PUT /tasks/ - creates a task
 * 
 * POST /tasks/12345/projects/12356 - add a project
 * 
 * DELETE /tasks/12345/projects/12346
 */

var HEADER_METHOD_OVERRIDE = "X-Method-Override";

function _get_method(){
  var method_override = acre.request.headers[HEADER_METHOD_OVERRIDE];
  return method_override || acre.request.method;
}


function _get_params(path_info){
  var split = path_info.slice(1).split("/");
  if (!split.length){
    return [];
  }


  var params = [ ["task", split[0]] ];
  if (split.length > 1){
      for (var x = 1; x < split.length; x+=2){
        params.push([split[x], split[x+1]|| null ]);
      }
  }

  return params;
}

if (acre.current_script === acre.request.script) {

  // This is a hack so that we can make sure tests can run by hitting this url
  if (acre.request.path_info.indexOf("/test_") == 0 ){
    acre.route(acre.request.url);
  }

  var method = _get_method();
  var base_url = acre.request.base_url;
  
  if (method == "GET"){
      service.GetService(function(){
         //TODO get task and output it
         return {
           "path_info": acre.request.path_info,
           "script_name": acre.request.script.name,
           "base_url": acre.request.base_url
         };

      }, this);
    
  } else if (method =="POST"){
      service.PostService(function(){
         //TODO get task and output it
         return "stuff";
      }, this);
    
  }

}