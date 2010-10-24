var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');


function get_file_revision(fileid, revision) {
  var resource = service.parse_path(fileid, {file:true});
  
  // it's remote... go get it
  if (resource.service_url !== FB.service_url) {
    var args = {
      fileid : fileid,
      revision : revision
    };
    var url = acre.form.build_url(resource.appeditor_service_base + "get_file_revision", args);
    return FB.fetch(url).result;
  }
  
  var ret = {
    fileid : resource.id,
    revision : revision        
  };

  if (!revision) {
    var source = acre.get_source(resource.path);
    if (typeof source === 'string') {
      ret.text = source;
    } else {
      ret.binary = resource.url;
    }
    return ret;
  }

  try {
    var req = FB.get_blob(revision, "unsafe");
    ret.content_type = req.headers['content-type'].split(';')[0];
    ret.text = req.body;
  } catch(e) {
    var error = service.parse_freebase_error(e);

    if (error && error.messages[0].code === "/api/status/error/invalid_content_type") {
      ret.content_type = error.messages[0].info.content_type;
      ret.binary = resource.url;
    } else {
      throw e
    }
  }
  return ret;
}


if (acre.current_script == acre.request.script) {    
  service.GetService(function() {
    var args = service.parse_request_args(['fileid']);

    return get_file_revision(args.fileid, args.revision);
    }, this);
  }
