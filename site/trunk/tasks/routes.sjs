var service = acre.require("/freebase/libs/service/lib", "release");

if (acre.current_script === acre.request.script) {
  if (acre.request.method == "GET"){
      service.GetService(function(){
         //TODO get task and output it
         return "stuff";
      }, this);
    
  } else if (acre.request.method =="POST"){
      service.PostService(function(){
         //TODO get task and output it
         return "stuff";
      }, this);
    
  }

}