var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');
var user;

function status_check(appid) {
    FB.touch();
    user = FB.get_user_info();

    var ret = {
        user : null,
        change : null
    };
    
    if (user) {
        ret.user = {
            name : user.username,
            full_name : user.name
        }
        var history = acre.require("lib_history").get_history(appid, 1, true, user.username);
        if (history.history && history.history.length) {
            ret.change = history.history[0];                
        }
    }    
            
    return ret;
}


if (acre.current_script == acre.request.script) {
    service.GetService(function() {
        var args = service.parse_request_args();
        return status_check(args.appid);
    }, this);
}
