var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');

function delete_app_all_files(appid) {
    var app = acre.require('get_app').get_app(appid);
        
    acre.require("delete_app").delete_app_files(app);
    
    return {
        appid : appid,
        files : []
    }
}

if (acre.current_script == acre.request.script) {    
    service.PostService(function() {
        var args = service.parse_request_args(['appid']);
        service.check_user();
        
        return delete_app_all_files(args.appid);
    }, this);
}
