var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');
var app_lib = acre.require('get_app');

function get_file(fileid, timestamp) {
    if (!fileid) { return null; }
    var resource = service.parse_path(fileid, {"file" : true});
    
    // it's remote... go get it
    if (resource.service_url !== FB.service_url) {
      var args = {
        fileid : fileid,
        timestamp : timestamp
      };
      var url = acre.form.build_url(resource.appeditor_service_base + "get_file", args);
      return FB.fetch(url).result;
    }
    
    var file;
    var app = app_lib.get_app(resource.appid, true, timestamp);
    file = app.files[resource.filename];

    if (!file) {
        throw new service.ServiceError("400 Bad Request", null, {
            message : "File: " + fileid + " doesn\'t exist or is not a file",
            code    : "/api/status/error/input/validation",
            info    : fileid
        });
    }
    
    if (file.revision) {
        var content = acre.require('get_file_revision').get_file_revision(fileid, file.revision);
        if (content.text) { file.text = content.text; }
        else if (content.binary) { file.binary = content.binary; }
    }

    file.app = {
      appid : app.appid,
      version : app.version,
      service_url : acre.freebase.service_url
    };

    return file;
}


if (acre.current_script == acre.request.script) {
    service.GetService(function() {
        var args = service.parse_request_args(['fileid']);
            
        return get_file(args.fileid, args.timestamp);
    }, this);
}
