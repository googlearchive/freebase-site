var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');

if (acre.current_script == acre.request.script) {
    service.PostService(function() {
        var args = service.parse_request_args(['appid']);
            
        return acre.require('lib_app_apikeys').list_keys(args.appid);        
    }, this);
}
