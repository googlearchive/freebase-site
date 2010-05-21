var MF = {
  "version": {
    "/freebase/apps/global": null,
    "/user/willmoffat/suggest": "2",
    "/freebase/libs/jquery": "8",
  }
};

if (acre.current_script == acre.request.script) {  
  var service = acre.require("/freebase/libs/service/lib", "release");
  service.GetService(function() {
    return MF;
  }, this);
}
