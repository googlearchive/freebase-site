var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');

if (acre.current_script == acre.request.script) {    
    service.PostService(function() {
        var args = service.parse_request_args(['appid','name','token']);
        service.check_user();
            
        return acre.require('lib_app_apikeys').add_key(args.appid, args.name, args.token, args.secret);        
    }, this);
}
