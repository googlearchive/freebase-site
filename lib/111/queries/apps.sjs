/*
 * Copyright 2012, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var h = acre.require("helper/helpers.sjs");
var validators = acre.require("validator/validators.sjs");
var ServiceError = acre.require('handlers/service_lib.sjs').ServiceError;
var apis = acre.require("promise/apis.sjs"),
    deferred = apis.deferred,
    freebase = apis.freebase,
    urlfetch = apis.urlfetch;


////////////////////
//                //
//    Utilities   //
//                //
////////////////////


function fix_timestamp(timestamp) {
  // TODO: regex is becuase of MQL-474
  if (timestamp.indexOf('Z') !== -1) {
    return /(.*)Z.*/.exec(timestamp)[1];
  } else {
    return timestamp;
  }
}

// HACK - necessary when doing as_of_time queries because of MQL's ID cache
function decompose_id(id) {
  var segs = id.split("/");
  var key = segs.pop();
  var path = segs.join("/");

  if (segs.length) {
    return {
      key : {
        value: key,
        namespace: decompose_id(path)
      }
    }
  } else {
    return "/";
  }
}

function parse_freebase_error(error) {
  try {
    var o = JSON.parse(error.response.body);
    return o;
  } catch (e) {
    return false;
  }
}

function handle_freebase_response(req) {
  var result = JSON.parse(req.body);

  if (!result.error) {

    var message;
    if (result.status != "200 OK") {
      message    = 'HTTP error: ' + result.status;
    } else if ('message' in result.messages[0]) {
      message    = result.code + ': ' + result.messages[0].message;
    } else {
      message    = result.code;
    }

    var exception      = new acre.freebase.Error(message);
    exception.response = result;
    exception.info     = result;
    throw exception;
  }

  return result;
}


////////////////////
//                //
//      Store     //
//                //
////////////////////

function get_user_info() {
  return freebase.get_user_info()
    .then(function(user) {
      if (!user) return null;
      return {
        id: user.id,
        guid: user.guid,
        name: user.username,
        full_name: user.name
      }
    });
};

function get_extended_user_info() {
  var options = {
    mql_output : {
      type : "/freebase/user_profile",
      guid : null,
      name : null,
      my_full_name : null,
      "!/type/usergroup/member" : {
        id : "/freebase/mwstaff",
        optional : true
      }
    }
  };

  return freebase.get_user_info(options)
    .then(function(env) {
      return env.result;
    })
    .then(function(result) {
      return {
        id              : result.id,
        guid            : result.guid,
        name            : result.name,
        full_name       : result.my_full_name,
        is_staff        : (result["!/type/usergroup/member"] ? true : false),
      };
    });
}

function get_freebase_store() {
  var r_user = get_user_info()
    .then(function(user) {
      if (user) {
        return list_user_apps(user)
          .then(function(apps) {
            user.apps = apps;
            return user;
          });
      }
      return null;
    });

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

  var r_handlers = freebase.mqlread(q)
    .then(function(env) {
      return env.result;
    })
    .then(function(result) {
      var handlers = {};
      result.instance.forEach(function(dt) {
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
      });
      return handlers;
    });

  return deferred.all([r_user, r_handlers], true)
    .then(function([user, handlers]) {
      return {
        host          : acre.host,
        version       : acre.version,
        acre_handlers : handlers,
        user          : user
      };
    });
}

function list_user_apps(user, include_filenames) {
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
        "member" : {
          "id" : user.id
        },
        "limit" : 0
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

  return freebase.mqlread([q])
    .then(function(env) {
      return env.result;
    })
    .then(function(result) {
      var apps = [];

      for each(var a in result) {
        var r = validators.AcreResource(a.id);
        var app = {};
        app.path = r.path;
        app.appid = r.appid;
        app.name = a.name;
        app.creator = a.creator;
        if (include_filenames) {
          app.files = [];
          for each (var f in a["/type/namespace/keys"]) {
            app.files.push(acre.freebase.mqlkey_unquote(f.value));
          }
        } else {
          app.files = a["c:/type/namespace/keys"];
        }
        apps.push(app);
      }

      return apps;
    });
}

function check_permission(versionid, user) {
  // As part of adding the key, verify that the app:
  // 1. Has non-default permissions
  // 2. That the user making this request has administrative rights
  var permission_query = {
    id : versionid,
    "forbid:permission" : {
      id : "/boot/all_permission",
      optional : "forbidden"
    },
    permission : {
      permits : {
        member : {
          id : user.id
        }
      }
    }
  };

  return freebase.mqlread(permission_query)
    .then(function(env) {
      if (env.result === null) {
        throw "User does not have permission to register a host for this app";
      } else {
        return env;
      }
    });
}

function check_host_availability(path, userid) {
  var check_query = {
    'a:id': path,
    id: null,
    name: null,
    "forbid:permission" : {
      id : "/boot/all_permission",
      optional : "forbidden"
    },
    permission : {
      permits : {
        member : {
          id : userid
        }
      },
      optional: true
    }
  };

  return freebase.mqlread(check_query)
    .then(function(env) {
      var check = env.result;
      if (!check) { return true; }
      if (check) {
        if (check.permission) { return {id:check.id, name:check.name}; }
        else { return false; }
      }
    });
}

function validate_host(host, user) {
  var promise = deferred.resolved();

  // if a short hostname is requested
  // check that the user is in metaweb staff
  if (host.length < 5) {
    promise = get_extended_user_info()
      .then(function(user) {
        if (!user.is_staff) {
          throw "Host must be at least 5 characters";
        }
      })
  }

  return promise
    .then(function() {
      // check whether the ID is available... or the user already "owns" it
      return check_host_availability(default_hostpath + '/' + host, user.id)
      .then(function(check_host) {
        if (!check_host) { throw "Already in use"; }
        var result = {};
        if (typeof check_host === 'object') {
          result = check_host;
          result.message = "Already in use by " + check_host.name + ".  Switch to this app?";
        } else {
          result.message = "Available";
        }
        return result;
      });
    });
}



////////////////////
//                //
//       App      //
//                //
////////////////////

function bad_appid(appid) {
  throw new ServiceError("400 Bad Request", "/api/status/error", {
    message : "App: " + appid + " doesn\'t exist",
    code    : "/api/status/error/input/no_app",
    info    : appid
  });
};

function create_app_query(app_guid) {
  var q = {
    id: null,
    guid: app_guid,
    timestamp: null,
    name: null,
    '/freebase/apps/acre_app/write_user' : {},
    '/freebase/apps/acre_app/based_on': {
      id: null,
      type: '/freebase/apps/acre_app',
      name: null,
      limit: 1,
      optional: true
    },
    '!/freebase/apps/acre_app/based_on': [{
      id: null,
      type: '/freebase/apps/acre_app',
      name: null,
      timestamp: null,
      sort : "-timestamp",
      optional: true
    }],
    type: [],
    "forbid:permission" : {
      "id" : "/boot/all_permission",
      "optional" : "forbidden"
    },
    permission : {
      id : null,
      permits : [{
        id : null,
        'a:id!=' : '/boot/schema_group',
        'b:id!=' : '/boot/domain_permission',
        member: [{
          type : '/freebase/user_profile',
          id : null,
          name : null,
          my_full_name : null
        }]
      }]
    },
    '/type/domain/owners': {
      id: null,
      optional: true
    },
    '/type/namespace/keys': [{
      value: null,
      namespace: {
        id  : null,
        guid : null,
        type: '/freebase/apps/acre_doc',
        '/common/document/updated' : null,
        '/common/document/content': {
          id: null,
          blob_id : null,
          media_type: null,
          length: null,
          optional: true
        },
        handler_key: null,
        handler: {
          handler_key: null,
          optional: true
        },
        based_on: {
          id: null,
          name: null,
          limit: 1,
          optional: true
        },
        permission: null
      },
      limit: 501,
      optional: true
    }],
    optional:true
  };

  // assemble app query
  return q;
}

function _format_app_query_results(appinfo, just_files) {
  if (!appinfo["/type/domain/owners"]) {
    throw new ServiceError("400 Bad Request", null, {
      message : "App: " + appinfo.id + " is not an app",
      code    : "/api/status/error/input/validation",
      info    : appinfo.id
    });
  }

  // Start creating the result object to pass back
  var r = {};

  // properties
  r.path           = "//" + appinfo.id.split("/").reverse().join(".") + "dev";
  r.id             = appinfo.id;
  r.acre_host      = null;
  r.repository     = null;
  r.guid           = appinfo.guid;
  r.name           = appinfo.name;
  r.creation_time  = appinfo.timestamp;
  r.version        = null;

  if (!just_files) {
    // TODO: inlclude homepage, description & article?
    r.listed         = null;

    // versions
    r.version        = null;
    r.release        = null;
    r.hosts          = [];
  }

  // permissions
  r.write_user     = appinfo['/freebase/apps/acre_app/write_user'] ? appinfo['/freebase/apps/acre_app/write_user'].name : null;

  // related apps
  r.parent         = appinfo['/freebase/apps/acre_app/based_on'] ? mini_app(appinfo['/freebase/apps/acre_app/based_on']) : null;
  r.children       = [];
  appinfo['!/freebase/apps/acre_app/based_on'].forEach(function(app){
    r.children.push(mini_app(app));
  });

  // authors
  r.authors        = {};
  var owners_id = appinfo['/type/domain/owners'].id;
  appinfo.permission.permits.forEach(function(group){
    var is_owner_group = (group.id === owners_id) ? true : false;
    group.member.forEach(function(r_user){
      var user = {};
      user.name = r_user.id.split('/')[2];
      user.full_name = r_user.my_full_name || r_user.name;
      user.admin = is_owner_group;
      r.authors[user.name] = user;
    });
  });

  // files
  r.files = {};
  appinfo['/type/namespace/keys'].forEach(function(entry){
    var doc = entry.namespace;                             // the file metadata from the graph
    if (doc.permission !== appinfo.permission.id) return;  // skip files with permissions that don't match app's

    var key = entry.value;
    var file = {
      path:   r.path + "/" + key,
      fileid: r.id + "/" + key
    };
    file.name = acre.freebase.mqlkey_unquote(key);
    file.guid = doc.guid;

    file.handler        = doc.handler_key || (doc.handler ? doc.handler.handler_key : null);
    file.media_type     = doc['/common/document/content'] ? doc['/common/document/content'].media_type.split('/').slice(2).join('/') : null;
    file.content_id     = doc['/common/document/content'] ? doc['/common/document/content'].id : null;
    file.content_hash   = doc['/common/document/content'] ? doc['/common/document/content'].blob_id : null;
    file.content_length = doc['/common/document/content'] ? doc['/common/document/content'].length : null;
    file.based_on       = doc.based_on;

    r.files[key] = file;
  });

  return r;
}

function mini_app(app) {
  return {
    path  : "//" + app.id.split("/").reverse().join(".") + "dev",
    id    : app.id,
    name  : app.name
  }
};

function make_graph_app(md, just_files) {
  // touch graph first to make sure we get the latest
  return freebase.touch()
    .then(function() {

      var env = {};

      if (md.as_of) { env.as_of_time = fix_timestamp(md.as_of); }

      return freebase.mqlread(create_app_query(md.guid), env)
        .then(function(env) {

          var leaf = env.result;
          if (!leaf) { bad_appid(md.id); }

          var ret = h.extend(md, _format_app_query_results(leaf, just_files));

          if(ret.versions && ret.versions.length) {
            ret.version = ret.versions[0];
          }

          ret.repository     = {
            url                     : acre.freebase.service_url,
            appeditor_service_base  : null,
            versioned               : true
          };
          return ret;

        })
        .then(function(ret) {
          if (just_files) return ret;

          return get_app_versions(validators.AcreResource(ret.id))
            .then(function(versions) {
              ret.listed          = versions.listed;
              ret.release         = versions.release;
              ret.hosts           = versions.hosts;
              ret.all_versions    = versions.versions;
              return ret;
            });

        });

    });
}

function make_disk_app(appinfo) {
  // properties
  appinfo.acre_host      = null;
  appinfo.repository     = {
    url                    : null,
    appeditor_service_base : null,
    versioned              : false
  };

  appinfo.name           = appinfo.id.split("/").pop();
  appinfo.creation_time  = null;
  appinfo.parent         = null;
  appinfo.children       = [];

  appinfo.listed         = false;
  appinfo.release        = null;
  appinfo.versions       = [];

  return appinfo;
};

function get_app (resource, just_files, timestamp) {
  // it's remote... go get it
  if (resource.service_url !== acre.freebase.service_url) {
    var args = {
      appid : appid,
      just_file : just_files,
      timestamp : timestamp
    };
    var url = acre.form.build_url(resource.appeditor_service_base + "get_app", args);
    return freebase.fetch(url)
      .then(function(env) {
        return env.result;
      });
  }

  function add_resource_info(ret) {
    ret.acre_host = resource.acre_host;
    ret.repository.appeditor_service_base = resource.appeditor_service_base;
    ret.current_file = resource.filename;
    return ret;
  };

  var md = h.extend(true, {}, acre.get_metadata(resource.app_path));
  if (timestamp) {
    md.as_of = timestamp;
    return make_graph_app(md, just_files)
      .then(function(ret) {
        return add_resource_info(ret);
      });
  } else {
    if (!md) { bad_appid(resource.appid); }

    switch (md.source) {
      case "freebase" :
        return make_graph_app(md, just_files)
          .then(function(ret) {
            return add_resource_info(ret);
          });
        break;
      default :
        return deferred.resolved()
          .then(function() {
            return make_disk_app(md);
          })
          .then(function(ret) {
            ret.repository.url = "http://" + resource.acre_host;
            return add_resource_info(ret);
          });
        break;
    }
  }
}

function get_app_status(resource) {
  return freebase.touch()
    .then(function() {

      return get_user_info()
        .then(function(user) {
          var ret = {
            user: user,
            change: null
          };
          if (!user) return ret;
          return get_history(resource, 1, true, user.name)
            .then(function(history) {
              ret.change = (history.history && history.history.length) ? history.history[0] : null;
              return ret;
            });
        });

    });
}

function prepare_clone_app(appid) {

  function add_text_revision(file, text) {
    return freebase.upload(text, file.content_type)
      .then(function(env) {
        file.content_id = env.result.id;
        return file;
      });
  };

  function add_binary_revision(file, url) {
    // Don't try to do a url upload from a local Acre server... we're not going to be able to reach it
    if (/acre\.z\//.test(url)) {
      file.content_id = null;
      return;
    }

    return freebase.fetch(acre.freebase.service_url + "/api/service/uri_submit_image", {
        method : "POST",
        headers : {"content-type":  "application/x-www-form-urlencoded"},
        content : "uri=" + encodeURIComponent(url),
        sign : true
      }).then(function(env) {
        file.content_id = env.result.id;
        return file;
      });
  }

  function remote_get_file(file, host) {
    var args = {
      fileid : file.fileid,
      revision : file.content_id
    };

    var url = acre.form.build_url(host + "get_file_revision", args);

    return freebase.fetch(url)
      .then(function(env) {
        if (env.result.text) {
          add_text_revision(file, env.result.text);
        } else if (env.result.binary) {
          add_binary_revision(file, env.result.binary);
        }
      },function(e) {
        console.log(e);
        file.content_id = null;
      });
  };

  function local_get_file(file) {
    // Same acre server (so shared cache)... probably on-disk
    var source = acre.get_source(file.path);

    var promise = (typeof source === "string") ?
                    add_text_revision(file, source) :
                    add_binary_revision(file, resource.url);

    return promise
      .then(null, function(e) {
        file.content_id = null;
        return file;
      });
  };

  return get_app(validators.AcreResource(appid), true)
    .then(function(app) {
      var promises = [];
      for (var filekey in app.files) {
        var file = app.files[filekey];

        if (!(file.content_id && (app.repository.url === acre.freebase.service_url))) {
          var current_host = acre.host.name + (acre.host.port ? ":" + acre.host.port : "");
          if (app.acre_host === current_host) {
            promises.push(local_get_file(file));
          } else {
            promises.push(remote_get_file(file, app.repository.appeditor_service_base));
          }
        }
      }

      return deferred.all(promises, true)
        .then(function() {
          return app;
        });
    });
}

function copy_files(from, to_id) {
  var init = deferred.resolved();

  if (typeof from === "string") {
    init = prepare_clone_app(from)
      .then(function(result) {
        from = result;
      });
  }

  init.then(function() {
    var q = {
      id : to_id,
    };

    var local = (from.repository.url === acre.freebase.service_url);
    if (local) {
      q['/freebase/apps/acre_app/based_on'] = {
        id: from.id,
        connect: 'insert'
      };
    }

    var keys = [];
    for (var filekey in from.files) {
      var file = from.files[filekey];
      var old_file_id = from.id + '/' + filekey;

      var add_file = {
        connect: 'insert',
        value: filekey,
        namespace: {
          create: 'unconditional',
          name: {
            value : file.name,
            lang : '/lang/en'
          },
          type: ['/freebase/apps/acre_doc','/common/document']
        }
      };

      if (file.handler) {
        add_file.namespace['/freebase/apps/acre_doc/handler_key'] = {
          value: file.handler,
          connect: "insert"
        };
      }

      if (file.content_id) {
        add_file.namespace['/common/document/content'] = file.content_id;
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

    return freebase.mqlwrite(q, {use_permission_of: to_id});
  });
}

function create_app(resource, name, clone, extra_group, user) {
  var appid = resource.appid;
  var appid_segs = appid.split('/');
  var app_key = appid_segs.pop();
  var app_root = appid_segs.join('/');

  validators.AcreAppKey(app_key);

  return freebase.mqlread({id:appid, type:'/freebase/apps/acre_app'})
    .then(function(env) {
      if (env.result) throw "An app with that ID already exists";

      // let's do the most expensive part first so if
      // we fail, we don't have a half-created app
      return prepare_clone_app(clone.appid || "//release.seed.apps.freebase.dev")
        .then(function(clone_app) {

          // create the permission group
          if (!name) { name = app_key; }

          var options = {};
          if (extra_group){
            options['extra_group'] = extra_group;
          }

          return freebase.create_group("Owners of " + name + " app", options)
            .then(function(env) {
              var group = env.result;

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
                  id : group.mid,
                  connect : "update"
                }
              };

              return freebase.mqlwrite(create_q, {use_permission_of : group.mid})
                .then(function(env) {
                  return copy_files(clone_app, appid);
                });
            });
        });
    });
}

function move_app(resource, to_resource) {
  appid = resource.appid;
  to_appid = to_resource.appid;

  var appid_segs = appid.split('/');
  var app_key = appid_segs.pop();
  var app_root = appid_segs.join('/');

  var to_appid_segs = to_appid.split('/');
  var to_app_key = to_appid_segs.pop();
  var to_app_root = to_appid_segs.join('/');

  validators.AcreAppKey(to_app_key);

  return freebase.mqlread({id: appid, guid: null})
    .then(function(env) {
      if (!env.result) bad_appid(appid);
      return env.result;
    })
    .then(function(app) {
      var app_guid = app.guid;

      return freebase.mqlwrite({
          guid : app_guid,
          type : '/freebase/apps/acre_app',
          'add:key' : {
            connect : 'insert',
            namespace : to_app_root,
            value : to_app_key
          },
          'remove:key' : {
            connect : 'delete',
            namespace : app_root,
            value : app_key
          }
        }).then(function(env) {
          return {
            appid : to_appid
          };

        });
    });
}

function set_app_properties(resource, name, listed, homepage, description, article) {
  var appid = resource.appid;

  return get_app_properties(appid)
    .then(function(app) {
      var ret = {
        appid : appid
      };

      var do_write = false;
      var write = {
        "id" : appid
      };

      if (name !== app.name) {
        var do_write = true;
        write['name'] = {
          "value" : name,
          "lang" : "/lang/en",
          "connect" : "update"
        };
        write['/type/domain/owners'] = {
          "name" : {
            "value" : "Owners of " + name + " app",
            "lang" : "/lang/en",
            "connect" : "update"
          }
        };
        ret.name = name;
      }

      if (typeof listed !== 'undefined') {
        if (listed !== app.listed) {
          var do_write = true;
          write['/freebase/apps/application/listed'] = {
            "value" : listed,
            "connect" : "update"
          };
          ret.listed = listed;
        }
      }

      if (typeof homepage !== 'undefined') {
        var homepage = app.homepage ? app.homepage : "";
        if (homepage !== homepage) {
          var do_write = true;
          write['/freebase/apps/application/homepage'] = {
            "value" : homepage,
            "connect" : "update"
          };
          ret.homepage = homepage;
        }
      }

      if (typeof description !== 'undefined') {
        var description = app.description ? app.description : "";
        if (description !== description) {
          var do_write = true;
          write['/freebase/apps/application/description'] = {
            "value" : description,
            "lang" : "/lang/en",
            "connect" : "update"
          };
          ret.description = description;
        }
      }

      var promises = [];

      if (do_write) {
        promises.push(freebase.mqlwrite(write));
      }

      if (typeof article !== 'undefined') {
        var app_article = "";
        if (app.article) {
          promises.push(freebase.get_blob(app.article.id)
            .then(function(env) {
              app_article = env.body;
            })
          );
        }
      }

      return deferred.all(promises, true)
        .then(function() {
          if ((typeof article !== 'undefined') && (article !== app_article)) {
            if (article == "") {
              return freebase.mqlwrite({
                "id" : appid,
                "/common/topic/article" : {
                  "id" : app.article.id,
                  "connect" : "delete"
                }
              })
              .then(function(env) {
                ret.article = true;
                return ret;
              });
            } else {
              var promise = deferred.resolved();
              if (!app.article) {
                promise = freebase.mqlwrite({
                  id : appid,
                  '/common/topic/article' : {
                    create: 'unless_connected',
                    type: [ {id: '/common/document'} ],
                    id: null
                  }
                })
                .then(function(env) {
                  app.article = {};
                  app.article.id = docwrite.result['/common/topic/article'].id;
                });
              }
              return promise.then(function() {
                return freebase.upload(article, 'text/plain', {document : app.article.id})
                .then(function() {
                  ret.article = true;
                  return ret;
                });
              });
            }
          }
        });
    });
}

function delete_app(resource) {
  return get_app(resource)
    .then(function(app) {
      var appid = app.id;
      var appid_segs = appid.split('/');
      var app_key = appid_segs.pop();
      var app_root = appid_segs.join('/');

      var promises = [];

      // delete published hosts
      if (app.hosts.length) {
        var p = delete_all_hosts(resource, app.hosts)
          .then(function(undeleted_hosts) {
            if (undeleted_hosts.length) {
              throw ("/service/delete_app/undeletable_hosts",
                "Cannot delete this app as it is released to non-standard hosts.  Please remove them manually first.",
                undeleted_hosts,
                "400 Bad Request");
            }
          });
        promises.push(p);
      }

      // disconnect the files
      promises.push(delete_app_files(app));

      // disconnect the app
      var delete_q = {
        id : app.id,
        key : {
          value : app_key,
          namespace : app_root,
          connect : 'delete'
        },
        type: [
          {id: '/common/topic',
          connect: 'delete'},
          {id: '/type/domain',
          connect: 'delete'},
          {id: '/freebase/apps/acre_app',
          connect: 'delete'},
          {id: '/freebase/apps/application',
          connect: 'delete'}
        ]
      };

      return deferred.all(promises, true)
        .then(function() {
          return freebase.mqlwrite(delete_q);
        });
    });
}



////////////////////
//                //
//    Versions    //
//                //
////////////////////

var hostpath = '/freebase/apps/hosts';
var default_hostpath = '/freebase/apps/hosts/com/freebaseapps';
var published_regex = /([^.]*)\.freebaseapps\.com$/;

function get_app_versions(resource) {
  var appid = resource.appid;

  function process_hosts(obj, version) {

    function _parse_host(obj, host) {
      if (obj.namespace.key) {
        return obj.value + '.' + _parse_host(obj.namespace.key, host);
      } else {
        return obj.value;
      }
    }

    var hosts = [];

    for each (var host in obj['three:key']) {
      hosts.push({
        host : _parse_host(host),
        version : version
      })
    }

    for each (var host in obj['two:key']) {
      hosts.push({
        host : _parse_host(host),
        version : version
      })
    }

    return hosts;
  }

  var q = {
    "id": appid,
    "/freebase/apps/acre_app_version/acre_app" : {
        "id" : null,
        "optional" : true
    },
    "/freebase/apps/application/listed" : null,
    "release:/type/namespace/keys": {
      "value": "release",
      "namespace": {
        "key": {
          "value!=": "release",
          "value":   null,
          "namespace": {
            "type": "/freebase/apps/acre_app"
          }
        }
      },
      "optional" : true
    },
    "release_key:/type/namespace/keys" : {
      "value" : "release",
      "namespace" : {
          "guid" : null
      },
      "optional" : true
    },
    "two:key": [{
      "value":    null,
      "value!=":  "release",
      "link": {
        "timestamp": null
      },
      "sort":     "-link.timestamp",
      "namespace": {
        "guid": null,
        "key": {
          "value": null,
          "namespace": {
            "id": "/freebase/apps/hosts"
          },
          "limit": 1
        }
      },
      "optional": true
    }],
    "three:key": [{
      "value":    null,
      "value!=":  "release",
      "link": {
        "timestamp": null
      },
      "sort":     "-link.timestamp",
      "namespace": {
        "guid": null,
        "key": {
          "value": null,
          "namespace": {
            "key": {
              "value": null,
              "namespace": {
                "id": "/freebase/apps/hosts"
              },
              "limit": 1
            }
          },
          "limit": 1
        }
      },
      "optional": true
    }],
    "/type/namespace/keys": [{
      "sort":     "-namespace.as_of_time",
      "value":    null,
      "value!=":  "release",
      "optional": true,
      "namespace": {
        "guid":       null,
        "type":       "/freebase/apps/acre_app_version",
        "as_of_time": null,
        "service_url":null,
        "two:key": [{
          "value":    null,
          "link": {
            "timestamp": null
          },
          "sort":     "-link.timestamp",
          "namespace": {
            "guid": null,
            "key": {
              "value": null,
              "namespace": {
                "id": "/freebase/apps/hosts"
              },
              "limit": 1
            }
          },
          "optional": true
        }],
        "three:key": [{
          "value":    null,
          "link": {
            "timestamp": null
          },
          "sort":     "-link.timestamp",
          "namespace": {
            "guid": null,
            "type" : {
                "id" : "/freebase/apps/acre_app",
                "optional" : "forbidden"
            },
            "key": {
              "value": null,
              "namespace": {
                "key": {
                  "value": null,
                  "namespace": {
                    "id": "/freebase/apps/hosts"
                  },
                  "limit": 1
                }
              },
              "limit": 1
            }
          },
          "optional": true
        }]
      }
    }]
  };

  return freebase.mqlread(q)
    .then(function(env) {
      var links = env.result;
      if (links == null) {
        throw "appid does not exist";
      }

      var result = {
        appid : appid,
        listed : links["/freebase/apps/application/listed"],
        release : null,
        hosts : [],
        versions : []
      };

      result.hosts = result.hosts.concat(process_hosts(links, 'current'));

      links["/type/namespace/keys"].forEach(function(v) {
        var version = {
          name       : v.value,
          as_of_time : v.namespace.as_of_time,
          service_url : v.namespace.service_url
        };
        result.hosts = result.hosts.concat(process_hosts(v.namespace, v.value));
        result.versions.push(version);
      });

      result.versions.sort(function(a,b) {
        var a_is_num = /\d+/.test(a.name);
        var b_is_num = /\d+/.test(b.name);

        if (a_is_num && b_is_num) {
          return parseInt(b.name) - parseInt(a.name);
        } else if (a_is_num) {
          return 1;
        } else if (b_is_num) {
          return -1;
        } else {
          return a.name > b.name;
        }
      });

      if (links['release:/type/namespace/keys']) {
        result.release = links['release:/type/namespace/keys'].namespace.key.value;
      }

      // HACK - need to know whether the release key exists,
      // even if not correctly associated with a version
      if (links['release_key:/type/namespace/keys'] && !result.release) {
        result.release_key_exists = links['release_key:/type/namespace/keys'].namespace.guid;
      }

      return result;
    });
}

function create_app_version(resource, key, timestamp, service_url) {
  var appid = resource.appid;

  return freebase.mqlread({id:appid, name:null})
    .then(function(env) {
      var app = env.result;
      if (!app) bad_appid(appid);

      // Make sure the version exists
      var create_q = {
        create: 'unless_exists',
        guid: null,
        type: '/freebase/apps/acre_app_version',
        acre_app : {
          id          : appid
        },
        key: {
          namespace   : appid,
          value       : key
        }
      };

      return freebase.mqlwrite(create_q, {use_permission_of: appid})
        .then(function(env) {
          var version_guid = env.result.guid;

          // Get existing properties
          return freebase.mqlread({
            guid : version_guid,
            type : '/freebase/apps/acre_app_version',
            service_url : null,
            as_of_time : null
            }).then(function(env) {
              var version = env.result;

              // Now update its properties
              var update_q = {
                guid: version_guid,
                type: '/freebase/apps/acre_app_version',
                name: {
                  value       : app.name + ", version " + key,
                  lang        : '/lang/en',
                  connect     : 'update'
                }
              };

              if (timestamp || (version.as_of_time === null)) {
                timestamp = timestamp || '__now__';

                update_q.as_of_time = {
                  value       : timestamp,
                  connect     : 'update'
                };
              }

              if (typeof service_url !== 'undefined') {
                if (/^http:/.test(service_url)) {
                  update_q.service_url = {
                    value   : service_url,
                    connect : 'update'
                  };
                } else if (version.service_url !== null) {
                  update_q.service_url = {
                    value   : version.service_url,
                    connect : 'delete'
                  };
                }
              }

              return freebase.mqlwrite(update_q, {use_permission_of: appid});
            });
        });
    });
}

function delete_app_version(resource, key) {
    var appid = resource.appid;
    var id = appid + '/' + key;

    var q = {
        id: id,
        type: '/freebase/apps/acre_app_version',
        acre_app : {
            id          : appid,
            connect     : 'delete'
        },
        key: {
            namespace   : appid,
            value       : key,
            connect     : 'delete'
        }
    };

    return freebase.mqlwrite(q, {use_permission_of: appid});
}

function set_app_release(resource, version) {
  var appid = resource.appid;

  h.enable_writeuser();

  // Lets make absolutely sure we're working off the latest state of the graph
  return freebase.touch()
    .then(function() {

      return get_app_versions(resource)
        .then(function(app) {

          var versionid = (version !== 'current') ? appid + '/' + version : appid;
          var delete_write = [];
          var add_write = [];

          // ugly stuff we have to keep around to deal with past bugs
          // that allowed claiming multiple freebaseapps hosts per app
          var freebaseapps_host = false;

          for each (var host in app.hosts) {
            var ar = host.host.split('.');
            var hostid = hostpath + '/' + ar.splice(1, ar.length).reverse().join('/');
            var val = host.host.split('.')[0];

            var old_versionid = (host.version !== 'current') ? appid + '/' + host.version : appid;
            delete_write.push({
              id : old_versionid,
              key : {
                value : val,
                namespace : hostid,
                connect : 'delete'
              }
            });

            if (!(published_regex.exec(host.host) && freebaseapps_host)) {
              if (published_regex.exec(host.host)) { freebaseapps_host = true; }

              add_write.push({
                id : versionid,
                key : {
                  value : val,
                  namespace : hostid,
                  connect : 'insert'
                }
              });
            }
          }

          // now let's do some damaage...
          var deletes = [];

          // delete all hosts
          if (delete_write.length) {
            // Don't sign so that the write user (appeditoruser)
            // credentials are used instead of the user's
            deletes.push(freebase.mqlwrite(delete_write, null, {"http_sign" : "keystore"}));
          }

          // delete old release key
          if (app.release || app.release_key_exists) {
            del_release_q = {
              key : {
                value : 'release',
                namespace : appid,
                connect : 'delete'
              }
            };
            if (app.release) { del_release_q.id = appid + '/' + app.release; }
            else { del_release_q.guid = app.release_key_exists; }
            deletes.push(freebase.mqlwrite(del_release_q));
          }

          return deferred.all(deletes, true)
            .then(function() {

              var adds = [];

              // add hosts to new version
              if (add_write.length) {
                // Don't sign so that the write user (appeditoruser)
                // credentials are used instead of the user's
                adds.push(freebase.mqlwrite(add_write, null, {"http_sign" : "keystore"}));
              }

              // add release key to new version
              if (version && version !== 'current') {
                var add_release_q = {
                  id : appid + '/' + version,
                  key : {
                    value : 'release',
                    namespace : appid,
                    connect : 'insert'
                  }
                };

                adds.push(freebase.mqlwrite(add_release_q));
              }

              return deferred.all(adds, true);
            });
        });
    });
}

function register_host(resource, hostname, user) {
  var appid = resource.appid;
  h.enable_writeuser();

  // Lets make absolutely sure we're working off the latest state of the graph
  return freebase.touch()
    .then(function() {

      var promises = {
        check_host : validate_host(hostname, user),
        app: get_app_versions(resource)
      }

      return deferred.all(promises, true)
        .then(function(r) {

          var app = r.app;
          var prev_app = r.check_host.id || null;
          var versionid = app.release ? appid + '/' + app.release : appid;


          // make sure user has permissions on the app being registered
          // since we're using special write_user permissions for this
          return check_permission(versionid, user)
            .then(function() {

              var deletes = [];

              // if this host was already in use by another app, delete it
              if (prev_app) {
                var delete_prev_app = {
                  id : prev_app,
                  key : {
                    value : hostname,
                    namespace : default_hostpath,
                    connect : 'delete'
                  }
                };
                // Sign with a write user (appeditoruser)
                // since it's a protected namespace
                deletes.push(freebase.mqlwrite(delete_prev_app, null, {"http_sign" : "keystore"}));
              }

              // delete all existing hosts on the default domain
              deletes.push(delete_all_hosts(resource, app.hosts));

              return deferred.all(deletes, true)
                .then(function() {

                  var adds = [];

                  // finally, add the new host
                  var add_new_host = {
                    id : versionid,
                    key : {
                      value : hostname,
                      namespace : default_hostpath,
                      connect : 'insert'
                    }
                  };
                  // Sign with a write user (appeditoruser)
                  // since it's a protected namespace
                  adds.push(freebase.mqlwrite(add_new_host, null, {"http_sign" : "keystore"}));


                  // also list in the directory if this is the first release
                  if (app.listed === null) {
                    var listing_write = {
                      id: appid,
                      type : {
                        id : "/freebase/apps/application",
                        connect : "insert"
                      },
                      "/freebase/apps/application/listed" : {
                        value : true,
                        connect : "update"
                      }
                    };

                    adds.push(freebase.mqlwrite(listing_write));
                  }

                  return deferred.all(adds, true);
                });
            });
        });
    });
}

function delete_all_hosts(resource, hosts) {
  var appid = resource.appid;

  var delete_old_hosts = [];
  var undeleted_hosts = [];

  h.enable_writeuser();

  for each (host in hosts) {
    var re = published_regex.exec(host.host);
    if (re) {
      var hostid = (host.version == 'current') ? appid : appid + '/' + host.version;
      delete_old_hosts.push({
        id : hostid,
        key : {
          value : re[1],
          namespace : default_hostpath,
          connect : 'delete'
        }
      });
    } else {
      undeleted_hosts.push(host.host);
    }
  }

  var promise = deferred.resolved();
  if (delete_old_hosts.length) {
    // Don't sign so that the write user (appeditoruser)
    // credentials are used instead of the user's
    promise = freebase.mqlwrite(delete_old_hosts, null, {"http_sign" : "keystore"});
  }

  return promise
    .then(function() {
      return undeleted_hosts;
    });
}



////////////////////
//                //
//    Authors     //
//                //
////////////////////

function add_app_author(resource, username) {
  var appid = resource.appid;
  var userid = '/user/' + username;

  var q = {
    id : appid,
    '/type/domain/owners' : {
      member: {
        id : userid,
        connect : 'insert'
      }
    }
  };

  return freebase.mqlwrite(q);
}

function remove_app_author(resource, username) {
  var appid = resource.appid;
  var userid = '/user/' + username;

  var q = {
    id : appid,
    '/type/domain/owners' : {
      member: {
        id : userid,
        connect : 'delete'
      }
    }
  };

  return freebase.mqlwrite(q);
}



////////////////////
//                //
//  Web Services  //
//                //
////////////////////

function set_app_writeuser(resource, enable, user) {
  var appid = resource.appid;
  var mql_action = enable ? 'insert' : 'delete';

  return freebase.mqlwrite({
      'id' : appid,
      '/freebase/apps/acre_app/write_user' : {
        'id' : user.id,
        'connect' : mql_action
      }
    }).then(function() {
      return {
        appid : appid,
        write_user : (enable ? user.name : null)
      };
    });
}

function keystore_fetch(resource, form) {
  var url = 'https:' + resource.app_path + "." + resource.acre_host + '/acre/keystore';
  form.format = "json";
  form.fb_token = acre.oauth.has_credentials("freebase").access_token;
  return freebase.fetch(url, {
      method  : "POST",
      content : acre.form.encode(form)
    }).then(function(env) {
      return {
        appid : resource.appid,
        keys : env.result
      }
    });
};

function list_keys(resource) {
  return keystore_fetch(resource, {
    action:  "list"
  });
}

function add_key(resource, name, key, secret) {
  return keystore_fetch(resource, {
    action:  "add",
    name:    name,
    token:   key,
    secret:  secret
  });
}

function delete_key(resource, name) {
  return keystore_fetch(resource, {
    action:  "remove",
    name:    name
  });
}



////////////////////
//                //
//      File      //
//                //
////////////////////

function get_file(resource, timestamp) {
  // it's remote... go get it
  if (resource.service_url !== acre.freebase.service_url) {
    var args = {
      fileid : resource.fileid,
      timestamp : timestamp
    };
    var url = acre.form.build_url(resource.appeditor_service_base + "get_file", args);
    return freebase.fetch(url)
      .then(function(env) {
        return env.result;
      });
  }

  return get_app(resource, true, timestamp)
    .then(function(app) {
      var filekey = acre.freebase.mqlkey_quote(resource.filename);
      var file = app.files[filekey];

      if (!file) {
        throw new ServiceError("400 Bad Request", null, {
          message : "File: " + fileid + " doesn\'t exist or is not a file",
          code    : "/api/status/error/input/validation",
          info    : fileid
        });
      }

      file.app = {
        appid : app.id,
        version : app.version,
        service_url : acre.freebase.service_url
      };

      file.fileid = file.app.appid + "/" + filekey;

      if (!file.content_id) return file;

      return get_file_revision(resource, file.content_id)
        .then(function(content) {
          if (content.text) { file.text = content.text; }
          else if (content.binary) { file.binary = content.binary; }
          return file;
        });
    });
}

function get_file_revision(resource, revision) {
  var ret = {
    fileid : resource.id,
    revision : revision
  };

  if (resource) {
    // it's remote... go get it
    if (resource && (resource.service_url !== acre.freebase.service_url)) {
      var args = {
        fileid : fileid,
        revision : revision
      };
      var url = acre.form.build_url(resource.appeditor_service_base + "get_file_revision", args);
      return freebase.fetch(url)
        .then(function(env) {
          return env.result;
        });
    }

    if (!revision) {
      var source = acre.get_source(resource.path);
      if (typeof source === 'string') {
        ret.text = source;
      } else {
        ret.binary = resource.url;
      }
      return ret;
    }
  }

  return freebase.get_blob(revision, "unsafe")
    .then(function(req) {
      ret.text = req.body;
      return ret;
    }, function(e) {
      var error = parse_freebase_error(e);
      if (error && error.messages[0].code === "/api/status/error/invalid_content_type") {
        ret.content_type = error.messages[0].info.content_type;
        ret.binary = resource.url;
        return ret;
      }
    });
}

function set_file_revision(resource, revision, name, acre_handler) {
  var fileid = resource.id;
  if (name) {
    rename_file(resource, name);
  }

  var w = {
    id: fileid,
    '/common/document/content':{
      'id': revision,
      'connect': 'update'
    }
  };

  if (acre_handler) {
    w['/freebase/apps/acre_doc/handler'] = {
      handler_key: acre_handler,
      connect: 'update'
    };
  }

  return freebase.mqlwrite(w);
}

function create_file(resource, name, handler, based_on) {
  var key = acre.freebase.mqlkey_quote(name);

  var w = {
    create : 'unless_exists',
    id     : null,
    guid   : null,
    name   : name,
    key    : {
      value: key,
      namespace: resource.appid
    },
    type    : [
      {
        id: '/freebase/apps/acre_doc',
        connect: 'insert'
      },
      {
        id: '/common/document',
        connect: 'insert'
      }
    ]
  };

  if (handler) {
    w['/freebase/apps/acre_doc/handler_key'] = {
      value: handler,
      connect: 'update'
    };
  }

  // link to original if based on another document
  if (based_on) {
    w['/freebase/apps/acre_doc/based_on'] = {
      id: based_on.id,
      connect: 'insert'
    };
  }

  return freebase.mqlwrite(w, {use_permission_of: resource.appid})
    .then(function(env) {
      return env.result;
    });
}

function delete_app_files(app, files) {
  if (!files) {
    files = [];
    for each (var file in app.files) {
      files.push(file.name);
    }
  }

  var promise = deferred.resolved();
  if (files.length > 0) {
    var q = [];
    for each (var file in files) {
      q.push({
        id: app.id + '/' + acre.freebase.mqlkey_quote(file),
        type: {
          id: '/freebase/apps/acre_doc',
          connect: 'delete'
        },
        key: {
          connect: 'delete',
          namespace: app.id,
          value: acre.freebase.mqlkey_quote(file)
        }
      });
    }
    promise = freebase.mqlwrite(q);
  }

  return promise.then(function() {
    return {
      appid : app.id,
      deleted_files : files
    }
  });
}

function delete_app_file(resource, name) {
  return get_app(resource, false)
    .then(function(app) {

      return delete_app_files(app, [name])
        .then(function() {
          delete app.files[acre.freebase.mqlkey_quote(name)];

          return {
              appid : app.id,
              files : app.files
          }
        });
    });
}

function delete_app_all_files(resource) {
  return get_app(resource)
    .then(function(app) {

      return delete_app_files(app)
        .then(function() {

          return {
              appid : appid,
              files : []
          }
        });
    });
}

function rename_file(resource, name) {
  return get_file(resource)
    .then(function(file) {
      var file_key = acre.freebase.mqlkey_quote(file.name);

      // no-op
      if (acre.freebase.mqlkey_quote(name) === file_key) { return; }

      return freebase.mqlwrite({
          guid : file.guid,
          type : '/freebase/apps/acre_doc',
          name : {
            value : name,
            lang : '/lang/en',
            connect : 'update'
          },
          key : {
            connect : 'insert',
            namespace : file.app.appid,
            value : acre.freebase.mqlkey_quote(name),
          }
        }).then(function(env) {

          return freebase.mqlwrite({
              guid : file.guid,
              type : '/freebase/apps/acre_doc',
              key : {
                connect : 'delete',
                namespace : file.app.appid,
                value : file_key
              }
            }).then(function(env) {

              return {
                fileid : file.fileid,
                name : name
              };
            });
        });
    });
}

function save_file_binary(resource, form_request, revision, name, based_on) {
  var fileid, filepath;

  return get_file(resource)
    .then(function(file) {
      fileid = file.fileid;
      filepath = file.path;

      var promises = [];
      if (file.handler !== "binary") {
        promises.push(freebase.mqlwrite({
          id : fileid,
          '/freebase/apps/acre_doc/handler_key' : {
            value: "binary",
            connect: 'update'
          }
        }));
      }

      if (name) {
        promises.push(rename_file(resource, name));
      }

      return deferred.all(promises, true);
    },function(e) {
      // file doesn't exist, so create it
      fileid = resource.id;
      filepath = resource.path;
      var name = name || acre.freebase.mqlkey_unquote(resource.filename);
      return create_file(resource, name, "binary", based_on);
    }).then(function() {
      var args = {
        document : fileid,
        license : '/common/license/cc_attribution_30'   // all images must be set to CC-BY to render at original size
      };

      if (revision) {
        args.content = revision;
      }

      var url = acre.form.build_url(acre.freebase.service_url + "/api/service/form_upload_image", args);
      var headers = {
        'content-type' : form_request.headers['content-type']
      };

      var args = {
        method: "POST",
        headers: headers,
        content: form_request.body,
        sign: true
      };
      return urlfetch(url, args)
        .then(function(env) {
          acre.syslog(JSON.stringify(env), "c");
          return handle_freebase_response(env).result;
        }, function(e) {
          acre.syslog(JSON.stringify(e), "xxx");
          var error = parse_freebase_error(e);
          if (error && error.messages[0].code === "/api/status/error/file_format/unsupported_mime_type") {
            throw new ServiceError("400 Bad Request", "/api/status/error/file_format/unsupported_mime_type", {
              message : "Unsupported content type - " + error.messages[0].info.mime_type + " - could not be saved.",
              code    : "/api/status/error/file_format/unsupported_mime_type",
              info    : error.messages[0].info.mime_type
            });
          } else {
            acre.syslog(JSON.stringify(e), "yyy");
            throw e;
          }
        }).then(function(ret) {
          return {
            path         : filepath,
            fileid       : fileid,
            content_id   : ret.content,
            content_type : ret.media_type.replace("/media_type/","")
          };
        });
    });
}

function save_file_text(r, text, content_type, revision, name, acre_handler, based_on) {

  function _set_handler() {
    return freebase.mqlwrite({
      id : r.id,
      '/freebase/apps/acre_doc/handler_key' : {
        value: acre_handler,
        connect: 'update'
      }
    });
  }

  var content_type = content_type || 'text/plain';

  var args = {
    document : r.id
  };

  var promises = [];
  // shortcut... if revision present, assume file already exists
  if (revision) {
    args.content = revision;

    if (acre_handler) {
      promises.push(_set_handler());
    }
  } else {
    // check whether file exists and create it if it doesn't
    var q = acre.freebase.extend_query({guid:null}, decompose_id(r.id));
    promises.push(freebase.mqlread(q)
      .then(function(env) {
        var file = env.result;
        if (!file) {
          var segs = r.id.split('/');
          var name = acre.freebase.mqlkey_unquote(segs.pop());
          var app = validators.AcreResource(segs.join('/'));
          return create_file(app, name, acre_handler, based_on);
        } else if (acre_handler) {
          return _set_handler();
        } else {
          return file;
        }
      }));
  }

  return deferred.all(promises, true)
    .then(function() {
      var promises = [];

      var result = {
        fileid       : r.id
      };

      if (name) {
        promises.push(rename_file(r, name));
      }


      if (text && text.length) {
        var p2 = freebase.upload(text, content_type, args)
          .then(function(env) {
            var upload = env.result;
            result.content_id = upload.content;
            result.content_type = upload.media_type.replace("/media_type/","");
            return upload;
          }, function(e) {
            if (e.code == 409) {
              return get_file_revision(r, e.errors[0].location)
                .then(function(old_file) {
                  var lib_patch   = get_lib_patch();
                  var diff = lib_patch.diff_lines(old_file.text, text);

                  throw new ServiceError("400 Bad Request", "/api/status/error/upload/content_mismatch", {
                    message : "Saved version of this file has changed since it was loaded.",
                    code    : "/api/status/error/upload/content_mismatch",
                    info    : {
                      diff: diff
                    }
                  });
                });
            }
            throw e;
          });

          promises.push(p2);
        }

      return deferred.all(promises, true)
        .then(function() {
          return result;
        });
    });
}



////////////////////
//                //
//    Changes     //
//                //
////////////////////

function get_lib_patch() {
  var lib_p = acre.require("diff/diff_match_patch.sjs");
  return new lib_p.diff_match_patch;
};


function get_history(resource, limit, for_app, exclude_user) {
  var id = resource.id;
  var ret = {};

  var q = [{
    "type":      "/type/link",
    "timestamp": null,
    "attribution": {
      "id":   null,
      "name": null,
      "creator": {
        "id":   null,
        "name": null
      }
    },
    "target": {
      "id": null,
      "length":     null,
      "media_type": null,
      "type":       "/type/content",
    },
    "source": {
      "type" : "/freebase/apps/acre_doc"
    },
    "valid" : null,
    "sort":      "-timestamp",
    "limit" : limit || 250
  }];

  if (for_app) {
    ret.appid = resource.appid;
    acre.freebase.extend_query(q, {
      "source.key": {
        "value":     null,
        "namespace": ret.appid
      }
    });
  } else {
    ret.fileid = resource.id;
    acre.freebase.extend_query(q, {
      "source.id" : ret.fileid
    });
  }

  if (exclude_user) {
    acre.freebase.extend_query(q, {
      "exclude:attribution" : {
        "id" : "/user/" + exclude_user,
        "optional" : "forbidden"
      }
    });
  }

  return freebase.mqlread(q)
    .then(function(env) {
      var list = [];
      for each (var rev in env.result) {
        var revision = {};
        if (for_app) {
          revision.file = rev.source.key.value;
        }
        revision.revision = rev.target.id;
        revision.timestamp = rev.timestamp;
        revision.content_type = rev.target.media_type.split('/').slice(2).join('/');;
        revision.length = rev.target.length;

        var attribution;
        if (rev.attribution.creator.id == "/user/user_administrator")
        attribution = { id: rev.attribution.id, name: rev.attribution.name }
        else
        attribution = { id: rev.attribution.creator.id, name: rev.attribution.creator.name }
        revision.attribution = attribution;
        list.push(revision);
      }

      ret.history = list;

      return ret;
    });
}

function diff_apps(resource1, resource2, timestamp1, timestamp2) {
  //return get_app(resource2, true, timestamp2);
  return deferred.all([
      get_app(resource1, true, timestamp1),
      get_app(resource2, true, timestamp2)
    ], true).then(function([app1, app2]) {
      var ret = {
        app1 : {
          appid : app1.id,
          timestamp: timestamp1
        },
        app2 : {
          appid : app2.id,
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
          if ((file1.content_id !== file2.content_id) || (file1.acre_handler !== file2.acre_handler)) {
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
    });
};

function diff_file(file1, file2, timestamp1, timestamp2) {
  return deferred.all({
      file1 : file1 ? get_file(file1, timestamp1) : null,
      file2 : file2 ? get_file(file2, timestamp2) : null
    }, true).then(function(ret) {

      // If no files, don't do a diff
      if (!ret.file1 && !ret.file2) {
        return ret;
      }

      // If any files are binary, don't do a diff
      if ((ret.file1 && ret.file1.binary) || (ret.file2 && ret.file2.binary)) {
        return ret
      }

      // If the files haven't changed, don't do a diff
      if (ret.file1 && ret.file2 && (ret.file1.content_id === ret.file2.content_id)) {
        return ret;
      }

      var text1 = ret.file1 && ret.file1.text ? ret.file1.text : "";
      var text2 = ret.file2 && ret.file2.text ? ret.file2.text : "";

      ret.diff = get_lib_patch().diff_lines(text2,text1);

      return ret;
    });
};

function find_common_revision(file1, file2) {
  var q = {
    "id": null,
    "type": "/type/content",
    "sort" : "-a:/type/reflect/any_reverse.link.timestamp",
    "limit" : 1,
    "a:/type/reflect/any_reverse": [{
      "link": {
        "source": {
          "id": file1.id
        },
        "timestamp": null,
        "valid": null,
        "master_property": "/common/document/content"
      }
    }],
    "b:/type/reflect/any_reverse": [{
      "link": {
        "source": {
          "id": file2.id
        },
        "timestamp": null,
        "valid": null,
        "master_property": "/common/document/content"
      }
    }]
  };

  return freebase.mqlread(q)
    .then(function(env) {
      return env.result ? env.result.id : null;
    });
}


function merge_files(target_resource, source_resource) {
  var source, target, ancestor;

  function _encode_patch_text(text) {
    // return encodeURI(text).replace(/\x0/g, '%00').replace(/%20/g, ' ');
    return text;
  }

  function _check_metadata_change(message){
    var metadata_change = false;
    if (source.name !== target.name) { metadata_change = true; }
    if (source.acre_handler !== target.acre_handler) { metadata_change = true; }
    if (source.content_type !== target.content_type) { metadata_change = true; }

    if (metadata_change) {
      ret.message = message;
      return ret;
    } else {
      _throw_patch_conflict(message);
    }
  }

  function _throw_patch_conflict(msg, info) {
    var error = new ServiceError("400 Bad Request", null, {
      message : msg,
      code    : "/api/status/error/merge/conflict"
    });

    error.messages[0].info = info || {
      source   : source,
      target   : target,
      ancestor : ancestor
    };

    throw error;
  }

  return deferred.all({
      source: source_resource ? get_file(source_resource) : null,
      target: target_resource ? get_file(target_resource) : null
    }, true).then(function(ret) {
      var lib_patch = get_lib_patch();
      source = ret.source;
      target = ret.target;

      /*
      *  Easy cases first:
      */

      // neither file exists
      if (!source && !target) {
        _throw_patch_conflict("Neither source nor target file exists");
      }

      // source doesn't exist - delete the file
      if (!source) {
        if (target.text) {
          ret.diff = lib_patch.diff_lines(target.text, "");
        }
        delete target.text;
        return ret;
      }

      // target doesn't exist - create the file
      if (!target) {
        if (source.text) {
          ret.diff = lib_patch.diff_lines("", source.text);
        }
        return ret;
      }

      // We can't merge binary files
      if (source.binary && target.binary) {
        return ret;
      }

      // Yikes.  Even worse.
      if (source.binary || target.binary) {
        _throw_patch_conflict("Can't merge text and binary");
      }


      /*
      *  Both files exist, let's compare revisions
      */

      // no change in content
      if (source.content_id === target.content_id) {
        return _check_metadata_change("No content changes")
      }

      // check for common ancestor revision between the files
      return find_common_revision(source_resource, target_resource)
        .then(function(ancestor_rev) {

          // no new changes, so don't provide diff
          if (ancestor_rev === source.content_id) {
            // make sure the revert doesn't happen client-side
            delete source.content_id
            return _check_metadata_change("This is an older version of the same file.");
          }

          // it's a simple, fast-forward merge
          if (ancestor_rev === target.content_id) {
            ret.diff = lib_patch.diff_lines(target.text, source.text);
            return ret;
          }

          /*
          *  OK, time to do a real merge
          */
          return get_file_revision(null, ancestor_rev)
            .then(function(r) {
              ancestor = r;
              if (!ancestor) {
                _throw_patch_conflict("Source and target files do not share a common ancestor.");
              }

              // diff the source and the ancestor and apply the patch to the target
              var patch = lib_patch.patch_make(ancestor.text, source.text);
              var result = lib_patch.patch_apply(patch, target.text);
              var conflict_text = "";

              ret.patch = {
                text : result[0],
                conflict : false
              };

              for (var p in patch) {
                if (!result[1][p]) {
                  var conflict = patch[p];

                  var str = "\n@@";
                  str += " -" + conflict.start1 + "," + conflict.length1;
                  str += " +" + conflict.start2 + "," + conflict.length2;
                  str += " @@";
                  str += "\n*-------- DELETE --------*\n";
                  str += _encode_patch_text(lib_patch.diff_text1(conflict.diffs));
                  str += "\n*-------- INSERT --------*\n";
                  str += _encode_patch_text(lib_patch.diff_text2(conflict.diffs));
                  str += "\n";

                  conflict_text += str;
                  ret.patch.conflict = true;
                }
              }

              if (conflict_text.length) {
                ret.patch.text =
                "*------- CONFLICTS ------*\n" +
                conflict_text +
                "*----- END CONFLICTS ----*\n\n\n" +
                ret.patch.text;
              }

              ret.diff = lib_patch.diff_lines(target.text, ret.patch.text);

              delete source.text;
              delete target.text;
              return ret;

            });
        });
    });
};

