var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');

if (acre.current_script == acre.request.script) {
    service.GetService(function() {
        var args = service.parse_request_args(['id']);
            
        return service.parse_path(args.id, args);
    }, this);
}