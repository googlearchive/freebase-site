var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');
var lib_app     = acre.require('get_app');


function diff_apps(appid1, appid2, timestamp1, timestamp2) {
    // normalize the timestamps
    var t1 = timestamp1 ? acre.freebase.date_from_iso(timestamp1) : new Date();
    var t2 = timestamp2 ? acre.freebase.date_from_iso(timestamp2) : new Date();
    timestamp1 = mjt.freebase.date_to_iso(t1);
    timestamp2 = mjt.freebase.date_to_iso(t2);

    var app1 = lib_app.get_app(appid1, true, timestamp1);
    var app2 = lib_app.get_app(appid2, true, timestamp2);    
    
    var ret = {
        app1 : {
            appid : appid1,
            timestamp: timestamp1
        },
        app2 : {
            appid : appid2,
            timestamp: timestamp2
        },
        files : {}
    };
    
    var new_guids = [];
    var guid_map = {};
    
    for (var fn in app1.files) {
        var file1 = app1.files[fn];
        var file2 = app2.files[fn];
        if (file2) {
            if ((file1.revision !== file2.revision) || (file1.acre_handler !== file2.acre_handler)) {
                ret.files[fn] = {
                    file1 : file1,
                    file2 : file2
                };
            }
        } else {
            new_guids.push(file1.guid);
            guid_map[file1.guid] = fn;
            ret.files[fn] = {
                file1 : file1,
                file2 : null,
            };
        }
    }
    
    for (var fn in app2.files) {
        var file1 = app1.files[fn];
        var file2 = app2.files[fn];
        if (!file1) {
            if (new_guids.indexOf(file2.guid) == -1) {
                ret.files[fn] = {
                    file1 : null,
                    file2 : file2
                };
            } else {
                ret.files[guid_map[file2.guid]].file2 = file2;
            }   
        }
    }
    
    return ret;
};


if (acre.current_script == acre.request.script) {
    service.GetService(function() {
        var args = service.parse_request_args(['appid1', 'appid2']);
            
        return diff_apps(args.appid1, args.appid2, args.timestamp1, args.timestamp2);
    }, this);
}