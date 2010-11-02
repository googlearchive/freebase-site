var service = acre.require("/freebase/libs/service/lib","release");

function stringify_template(libid, template, args) {
  var lib = acre.require(libid);
  return acre.markup.stringify(lib[template].apply(this, args));
}

service.GetService(function(){
  var libid = "/freebase/apps/attribution/templates";
  var template = acre.request.path_info.slice(1);
  var args = [acre.request.params.id];
  
  return {
    library: libid,
    template: template,
    topic_id: (args[0] || null),
    code: stringify_template(libid, template, args)
  }
}, this);
