var service = acre.require("/freebase/libs/service/lib", "release");


service.GetService(function(){
    return "Oh, hai";                     
}, this);

acre.write("OHHAI");

