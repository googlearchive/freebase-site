var service = acre.require('lib_appeditor_service');
var ae_url = acre.request.app_url.replace(/^https/,"http");
var keystore_path = '/acre/keystore';

function get_app_guid(appid) {
    if (/^#/.test(appid)) {
        // it's already a guid
        return appid;
    }
    appid = service.parse_path(appid).appid;
    return FB.mqlread({id: appid, guid: null}).result.guid;        
}

function list_keys(appid) {

    var form = {
        method :    "LIST",
        appid:      get_app_guid(appid)
    };

    var result = FB.fetch(ae_url + keystore_path, { method  : "POST", 
                                                    content : acre.form.encode(form), 
                                                    sign    : true });

    return { 
        appid : appid,
        keys : result.keys 
    }
}

function add_key(appid, name, key, secret) {
    
    var form = {
        method :    "POST",
        appid:      get_app_guid(appid),
        name:       name,
        token:      key, 
        secret:     secret
    };

    var result = FB.fetch(ae_url + keystore_path, { method  : "POST", 
                                                    content : acre.form.encode(form), 
                                                    sign    : true });
                                                    
    return list_keys(appid);
}

function delete_key(appid, name) {
    
    var form = {
        method:     "DELETE",
        appid:      get_app_guid(appid),
        name:       name
    };
    
    var result = FB.fetch(ae_url + keystore_path, { method  : "POST", 
                                                    content : acre.form.encode(form), 
                                                    sign    : true });
                                                                
    return list_keys(appid);
}
