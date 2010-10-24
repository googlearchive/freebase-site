var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');
var user;

var appeditor_path = "//appeditor.apps.freebase.dev" 


function add_text_revision(file, text) {
  FB.upload(text, file.content_type, {
    callback : function(envelope) {
      file.revision = envelope.result.id;
    }
  });
};


function add_binary_revision(file, url) {
  // Don't try to do a url upload from a local Acre server... we're not going to be able to reach it
  if (/acre\.z\//.test(url)) {
    file.revision = null;
    return;
  }

  FB.fetch(FB.service_url + "/api/service/uri_submit_image", {
    method : "POST",
    headers : {"content-type":  "application/x-www-form-urlencoded"},
    content : "uri=" + encodeURIComponent(url),
    sign : true,
    callback : function(envelope) {
      file.revision = envelope.result.id;      
    }
  });
}


function remote_get_file(file, host) {
  var args = {
    fileid : file.fileid,
    revision : file.revision
  };
  
  var url = acre.form.build_url(host + "get_file_revision", args);

  FB.fetch(url, {
    callback: function(envelope) {
      if (envelope.result.text) {
        add_text_revision(file, envelope.result.text);
      } else if (envelope.result.binary) {
        add_binary_revision(file, envelope.result.binary);
      }
    },
    errback : function(e) {
      console.log(e);
      file.revision = null;
    }
  });
};


function local_get_file(file) {
  // Same acre server (so shared cache)... probably on-disk
  try {
    var source = acre.get_source(file.path);
    if (typeof source === "string") {
      add_text_revision(file, source);
    } else {
      add_binary_revision(file, resource.url);
    }          
  } catch (e) {
    file.revision = null;
  }
};


function prepare_clone_app(appid) {
  var app = acre.require("get_app").get_app(appid, true);

  for (var filekey in app.files) {
    var file = app.files[filekey];

    if (!(file.revision && (app.repository.url === FB.service_url))) {
      var current_host = acre.host.name + (acre.host.port ? ":" + acre.host.port : "");
      if (app.acre_host === current_host) {
        local_get_file(file);
      } else {
        remote_get_file(file, app.repository.appeditor_service_base);
      }
    }
  }
  acre.async.wait_on_results();

  return app;
}


function copy_files(from, to_id) {
  if (typeof from === "string") {
    from = prepare_clone_app(from);
  }

  var q = {
    id : to_id,
  };
  
  var local = (from.repository.url === FB.service_url);
  if (local) {
    q['/freebase/apps/acre_app/based_on'] = {
      id: from.appid,
      connect: 'insert'
    };
  }

  var keys = [];
  for (var filekey in from.files) {
    var file = from.files[filekey];
    var old_file_id = from.appid + '/' + filekey;

    var add_file = {
      connect: 'insert',
      value: filekey,
      namespace: {
        create: 'unconditional',
        name: {
          value : file.name,
          lang : '/lang/en'  
        },
        type: ['/freebase/apps/acre_doc','/common/document'],
        '/freebase/apps/acre_doc/handler': {
          handler_key: file.acre_handler
        }
      }
    };

    if (file.revision) {
      add_file.namespace['/common/document/content'] = file.revision;
    }
    
    if (local) {
      add_file.namespace['/freebase/apps/acre_doc/based_on'] = {
        id: old_file_id,
        connect: 'insert'
      };
    }

    keys.push(add_file);
  }

  if (keys.length > 0) { q['/type/namespace/keys'] = keys; }

  var result = FB.mqlwrite(q, {use_permission_of: to_id});

  return result;
}


function create_app(appid, name, clone, extra_group) {
  appid = service.parse_path(appid).appid;

  var appid_segs = appid.split('/');
  var app_key = appid_segs.pop();
  var app_root = appid_segs.join('/');

  // Awful, dirty hack for WebDAV clients
  var allowed_keys = {
    "untitled$0020folder" : true
  };

  if (!(app_key in allowed_keys) && !(/^[a-z][\-0-9a-z]{0,20}$/).test(app_key)) {
    throw "Invalid app key (only lowercase alpha, numbers, and - allowed)";
  }

  var check_exists = FB.mqlread({id:appid, type:'/freebase/apps/acre_app'}).result;
  if (check_exists) {
    throw "An app with that ID already exists";
  }
  
  // let's do the most expensive part first so if
  // we fail, we don't have a half-created app
  var clone_app = prepare_clone_app(clone || "//release.seed.apps.freebase.dev");

  // create the permission group
  if (!name) { name = app_key; }

  var options = {};
  if (extra_group){
    options['extra_group'] = extra_group;
  }

  var group = FB.create_group("Owners of " + name + " app", options).result;

  // make it an app
  var create_q = {
    create : 'unless_exists',
    key : {
      value : app_key,
      namespace : app_root
    },
    name : name,
    type: [
      {id: '/type/domain',
      connect: 'insert'},
      {id: '/common/topic',
      connect: 'insert'},
      {id: '/freebase/apps/acre_app',
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
  
  copy_files(clone_app, appid);

  return acre.require('list_user_apps').list_user_apps(user.id);
}


if (acre.current_script == acre.request.script) {
  service.PostService(function() {
    var args = service.parse_request_args(['appid']);
    user = service.check_user();

    return create_app(args.appid, args.name, args.clone, args.extra_group);        
    }, this);
  }
