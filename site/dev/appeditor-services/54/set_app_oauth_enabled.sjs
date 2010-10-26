var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');
var lib_apikeys = acre.require('lib_app_apikeys');


// this is true for any environment
var keyname = 'freebase.com';


function enable_oauth(appid) {
    var appguid = lib_apikeys.get_app_guid(appid);
    
    // 1. make sure app is an application
    FB.mqlwrite({
        guid : appguid,
        type : { 
            id      : '/freebase/apps/application',
            connect : 'insert',
        }
    });
    
    // 2. Enable oauth and get key and secret
    var url = acre.freebase.service_url.replace(/^http:\/\//, 'https://') + '/api/oauth/enable';
    var form = { id: appguid, reset_secret: true};
    var o = FB.fetch(url, { method  : "POST", 
                            content : acre.form.encode(form), 
                            sign    : true });
    
    
    // 3. Add key and secret to keystore
    lib_apikeys.add_key(appguid, keyname, o.key, o.secret);
    
    // 4. Mark app as enabled in the graph
   FB.mqlwrite({
        guid : appguid,
        '/freebase/apps/application/oauth_enabled': {
            connect : 'update', 
            value   : true
        }
    });
    
    return {
        appid : appid,
        oauth_enabled : true
    };
}


function disable_oauth(appid) {
    var appguid = lib_apikeys.get_app_guid(appid);

    // 1. Disable oauth and get key and secret
    var url = acre.freebase.service_url.replace(/http:\/\//, 'https://') + '/api/oauth/disable';
    var form = { id: appguid, reset_secret: true};
    var o = FB.fetch(url, { method  : "POST", 
                            content : acre.form.encode(form), 
                            sign    : true });
    
    // 2.Remove key and secret from keystore
    lib_apikeys.delete_key(appguid, keyname);
    
     // 3. Mark app as disabled in the graph
    FB.mqlwrite({
         guid : appguid,
         '/freebase/apps/application/oauth_enabled': {
             connect : 'update', 
             value   : false
         }
     });
    
    return  {
         appid : appid,
         oauth_enabled : false
     };
}


if (acre.current_script == acre.request.script) {    
    service.PostService(function() {
        var args = service.parse_request_args(['appid']);
        service.check_user();
        
        if (args.enable == 'false' || args.enable == '0') {
            return disable_oauth(args.appid);
        } else {
            return enable_oauth(args.appid);            
        }
    }, this);
}





