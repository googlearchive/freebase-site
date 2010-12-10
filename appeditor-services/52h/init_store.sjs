var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');
var user;

function init_store() {
    
    user = FB.get_user_info();
    r_user = null;
    if (user) {
        r_user = {
            name : user.username,
            full_name : user.name,
            apps : acre.require('list_user_apps').list_user_apps(user.id)
        }
    }
    
    var exp = false;
    var status = exp ? null : 'Current';

    var q = {
      'id' : '/freebase/apps/acre_handler',
      'type' : '/type/type',
      'instance' : [{
          'type' : '/freebase/apps/acre_handler',
          'handler_key' : null,
          'plural_name' : null,
          'short_description' : null,
          'allowed_media_types' : [],
          'name' : null,
          'status' : status,
          'b:status' : {
            'name' : 'Deprecated',
            'optional' : 'forbidden'  
          },
          'index' : null,
          'sort' : 'index'
      }]
    };
    
    var result = FB.mqlread(q).result;
    
    var handlers = {};
    var list = result.instance;
    for (var a in list) {
        var dt = list[a];
        for (var mt in dt.allowed_media_types) {
            dt.allowed_media_types[mt] = dt.allowed_media_types[mt].slice(12);
        }
        handlers[dt.handler_key] = {
            key: dt.handler_key,
            name: dt.name,
            plural_name: dt.plural_name,
            supported_mime_types: dt.allowed_media_types,
            description: dt.short_description
        };            
    }
            
    return {
        host          : acre.host,
        version       : acre.version,
        acre_handlers : handlers,
        user          : r_user
    }
}


if (acre.current_script == acre.request.script) {
    service.GetService(function() {
        return init_store();
    }, this);
}
