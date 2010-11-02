var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');


function list_user_apps(userid, include_filenames) {
    
    var q = {
        "type" : "/freebase/apps/acre_app",
        "limit" : 250,
        "id" : null,
        "name" : null,
        "creator" : {
            'id' : null,
            'name' : null
        },
        "sort" : "name",
        "c:/type/namespace/keys" : {
            "namespace" : {
                "type" : "/freebase/apps/acre_doc"
            },
            "return" : "count",
            "optional" : true
        },
        "forbid:permission" : {
          "id" : "/boot/all_permission",
          "optional" : "forbidden"
        },
        "permission" : {
            "permits"  : {
                "limit" : 1,
                "member" : {
                    "id" : userid
                }
            }
        }
    };
    
    if (include_filenames) { 
        q["/type/namespace/keys"] = [{
            "sort" : "value",
            "optional" : true,
            "value" : null,
            "namespace" : {
                "type" : "/freebase/apps/acre_doc",
            }
        }];
    }
    
    var apps = [];
    var result = FB.mqlread([q]).result;    

    for each(var a in result) {
        var r = service.parse_path(a.id);
        var app = {};
        app.path = r.path;
        app.appid = r.appid;
        app.name = a.name;
        app.creator = a.creator;
        if (include_filenames) {
            app.files = [];
            for each (var f in a["/type/namespace/keys"]) {
                app.files.push(FB.mqlkey_unquote(f.value));
            }
        } else {
            app.files = a["c:/type/namespace/keys"];
        }
        apps.push(app);
    }
    
    return apps;
}


if (acre.current_script == acre.request.script) {    
    service.GetService(function() {
        var args = service.parse_request_args();
        user = service.check_user();
        FB.touch();
        
        return list_user_apps(user.id, args.include_filenames);
    }, this);
}
