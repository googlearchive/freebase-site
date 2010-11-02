var mf = acre.require("MANIFEST").mf;
var req = acre.request;
var FB = acre.freebase;

function create_app(args) {
  var name = "New App";
  var group = FB.create_group("Owners of " + name + " app").result;

  var create_q = {
    create : 'unconditional',
    name : name,
    id : null,
    type: [
      {id: '/type/domain',
      connect: 'insert'},
      {id: '/common/topic',
      connect: 'insert'},
      {id: '/freebase/apps/application',
      connect: 'insert'}
    ],
    "/type/domain/owners" : {
      id : group.id,
      connect : "update"
    }
  };
  var res = FB.mqlwrite(create_q, {use_permission_of : group.id}).result;
  return res.id;
}

function set_app_properties(args) {
  if (!args.appid) { throw "Missing appid argument"; }
  var api = acre.require("/freebase/apps/appeditor/set_app_properties");
  return api.set_app_properties(args.appid, args);
}

function add_icon(args) {
  if (!args.appid) { throw "Missing appid argument"; }
  
  var name = args.name || "";
  var url = FB.service_url + "/api/service/form_upload_image";
  var opts = {
    method : "POST",
    headers : {
      'content-type' : req.headers['content-type']
    },
    content : req.body,
    sign : true
  };
  
  var upload = mf.require("service", "lib").handle_freebase_response(acre.urlfetch(url, opts)).result;
  //var upload = FB.fetch(url, opts).result;
  
  FB.mqlwrite({
    id: args.appid,
    "/freebase/apps/application/icon": {
      id : upload.id,
      connect : "update",
      name : {
        value : name,
        lang : "/lang/en",
        connect : "update"
      }
    }
  });

  return {
    id : upload.id,
    name : name
  };
}

function delete_icon(args) {
  if (!args.iconid) { throw "Missing iconid argument"; }

  return FB.mqlwrite({
    id: args.appid,
    "/freebase/apps/application/icon": {
      id : args.iconid,
      connect : "delete"
    }
    }).result;
  }