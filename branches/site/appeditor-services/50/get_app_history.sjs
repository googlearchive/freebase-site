var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');

if (acre.current_script == acre.request.script) {    
    service.GetService(function() {
        var args = service.parse_request_args(['appid']); 
        return acre.require("lib_history").get_history(args.appid, parseInt(args.limit), true, args.exclude_user);
    }, this);
}
