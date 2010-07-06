var mf = acre.require("MANIFEST").MF;
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
  
  var queries = mf.require("queries");
  var app;
  queries.app(args.appid, {article:true})
    .then(function(r) {
      app = r;
    });
  acre.async.wait_on_results();
  
  var ret = {
    appid : args.appid
  };

  var do_write = false;
  var write = {
    "id" : args.appid
  };

  if (args.name !== app.name) {
    var do_write = true;
    write['name'] = {
      "value" : args.name,
      "lang" : "/lang/en",
      "connect" : "update"
    };
    write['/type/domain/owners'] = {
      "name" : {
        "value" : "Owners of " + args.name + " app",
        "lang" : "/lang/en",
        "connect" : "update"
      }
    };
    ret.name = args.name;
  }

  if (typeof args.listed !== 'undefined') {
    var listed = null;
    if (args.listed == "1") { listed = true; }
    if (args.listed == "0") { listed = false; }

    if (listed !== app.listed) {
      var do_write = true;
      write['/freebase/apps/application/listed'] = {
        "value" : listed,
        "connect" : "update"
      };
      ret.listed = args.listed;   
    }
  }

  if (typeof args.homepage !== 'undefined') {
    var homepage = app.homepage ? app.homepage : "";
    if (args.homepage !== homepage) {
      var do_write = true;
      write['/freebase/apps/application/homepage'] = {
        "value" : args.homepage,
        "connect" : "update"
      };
      ret.homepage = args.homepage;
    }
  }

  if (typeof args.description !== 'undefined') {
    var description = app.description ? app.description : "";
    if (args.description !== description) {
      var do_write = true;
      write['/freebase/apps/application/description'] = {
        "value" : args.description,
        "lang" : "/lang/en",
        "connect" : "update"
      };
      ret.description = args.description;
    }
  }

  if (do_write) { FB.mqlwrite(write); }

  if (typeof args.article !== 'undefined') {
    var article = app.article ? app.article.text : "";
    if (args.article !== article) {
      if (args.article == "") {
        FB.mqlwrite({
          "id" : args.appid,
          "/common/topic/article" : {
            "id" : app.article.id,
            "connect" : "delete"
          }
        });
      } else {
        if (!app.article) {
          var docwrite = FB.mqlwrite({
            id : args.appid,
            '/common/topic/article' : {
              create: 'unless_connected',
              type: [ {id: '/common/document'} ],
              id: null
            }
          });
          app.article = {};
          app.article.id = docwrite.result['/common/topic/article'].id;
        }
        FB.upload(args.article, 'text/plain', {document : app.article.id});
      }
      ret.article = true;
    }
  }

  return ret;
}

function add_icon(args) {
  if (!args.appid) { throw "Missing appid argument"; }
  
  var service = mf.require("service", "lib");
  var name = args.name || "";
  var url = FB.service_url + "/api/service/form_upload_image";
  var headers = {
    'content-type' : req.headers['content-type']
  };
  var upload = service.handle_freebase_response(acre.urlfetch(url, "POST", headers, req.body, true)).result;
  
  /*
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
  var upload = acre.freebase.fetch(url, opts).result;
  */
  
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