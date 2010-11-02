var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');
var app_lib = acre.require('get_app');
    
function delete_app_file(appid, name) {
    var app = app_lib.get_app(appid, false);
        
    acre.require('delete_app').delete_app_files(app, [name]);
    
    delete app.files[FB.mqlkey_quote(name)];

    return {
        appid : appid,
        files : app.files
    }
}

if (acre.current_script == acre.request.script) {    
    service.PostService(function() {
        var args = service.parse_request_args(['appid', 'name']);
        service.check_user();
        
        return delete_app_file(args.appid, args.name);
    }, this);
}
