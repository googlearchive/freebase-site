/*
 * Copyright 2010, Google Inc.
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

var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');

function fix_timestamp(timestamp) {
  // TODO: regex is becuase of MQL-474
  if (timestamp.indexOf('Z') !== -1) {
    return /(.*)Z.*/.exec(timestamp)[1];        
  } else {
    return timestamp;
  }
}

function create_app_query(app_guid) {
  var q = {
    id: null,
    guid: app_guid,
    timestamp: null,
    name: null,
    '/freebase/apps/acre_app/write_user' : {},
    '/freebase/apps/application/oauth_enabled' : null,
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


function mini_app(app) {
  return {
    path  : "//" + app.id.split("/").reverse().join(".") + "dev",
    id    : app.id,
    name  : app.name
  }
};


function _format_app_query_results(appinfo, just_files) {

  if (!appinfo["/type/domain/owners"]) {
    throw new service.ServiceError("400 Bad Request", null, {
      message : "App: " + appinfo.id + " is not an app",
      code    : "/api/status/error/input/validation",
      info    : appinfo.id
    });
  }

  // Start creating the result object to pass back
  var r = {};

  // properties
  r.path           = "//" + appinfo.id.split("/").reverse().join(".") + "dev";
  r.appid          = appinfo.id;
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
    r.release        = null;
    r.hosts          = [];
    r.versions       = [];
  }

  // permissions
  r.write_user     = appinfo['/freebase/apps/acre_app/write_user'] ? appinfo['/freebase/apps/acre_app/write_user'].name : null;
  r.oauth_enabled  = appinfo['/freebase/apps/application/oauth_enabled'];

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
      path : r.path + "/" + key,
      fileid : r.appid + "/" + key
    };
    file.name = FB.mqlkey_unquote(key);
    file.guid = doc.guid;

    file.acre_handler   = doc.handler ? doc.handler.handler_key : 'passthrough';
    file.content_type   = doc['/common/document/content'] ? doc['/common/document/content'].media_type.split('/').slice(2).join('/') : null;
    file.revision       = doc['/common/document/content'] ? doc['/common/document/content'].id : null;
    file.content_length = doc['/common/document/content'] ? doc['/common/document/content'].length : null;
    file.SHA256         = doc['/common/document/content'] ? doc['/common/document/content'].blob_id : null;
    file.based_on       = doc.based_on;
    
    r.files[key] = file;
  });

  return r;
}


function make_graph_app(md, just_files, timestamp) {
  // touch graph first to make sure we get the latest
  FB.touch();
  var env = {};
  if (md.as_of) { env.as_of_time = fix_timestamp(md.as_of); }
  var leaf = FB.mqlread(create_app_query(md.app_guid), env).result;
  if (!leaf) { bad_appid(md.app_id); }
  
  var ret = _format_app_query_results(leaf, just_files);
  
  if(md.versions && md.versions.length) {
    ret.version = md.versions[0];
  }

  if (!just_files) {
    var versions = acre.require('lib_app_versions').get_versions(md.app_id);
    ret.listed         = versions.listed;
    ret.release        = versions.release;
    ret.hosts          = versions.hosts;
    ret.versions       = versions.versions;
  }
  
  ret.repository     = {
    url                     : FB.service_url,
    appeditor_service_base  : null,
    versioned               : true
  };
  
  return ret;
}


function make_disk_app(appinfo) {
  var r = {};
  
  // properties  
  r.path           = "//" + appinfo.app_id.split("/").reverse().join(".") + "dev";
  r.appid          = appinfo.app_id;
  r.acre_host      = null;
  r.repository     = {
      url                    : null,
      appeditor_service_base : null,
      versioned              : false,
  };
  r.guid           = appinfo.app_guid;
  r.name           = appinfo.app_id.split("/")[1];
  r.creation_time  = null;
  r.version        = appinfo.versions.length ? appinfo.versions[0] : null;
  r.oauth_enabled  = null;
  r.write_user     = appinfo.service_metadata.write_user;
  r.parent         = null;
  r.children       = [];
  r.listed         = false;
  r.release        = null;
  r.hosts          = [];
  r.versions       = [];
  r.files          = {};
  
  for (var name in appinfo.files) {
    var key = FB.mqlkey_quote(name);
    var file = appinfo.files[name];
    
    r.files[key] = {
      path : r.path + "/" + name,
      fileid : appinfo.app_id + "/" + key,
      name : name,
      acre_handler : file.handler,
      content_type : file.media_type,
      content_hash : file.content_hash,
      revision : null,
      based_on : null
    };
  }
  
  return r;
};

function bad_appid(appid) {
  throw new service.ServiceError("400 Bad Request", "/api/status/error", {
    message : "App: " + appid + " doesn\'t exist",
    code    : "/api/status/error/input/no_app",
    info    : appid
  });
};


function get_app (appid, just_files, timestamp) {
  var resource = service.parse_path(appid);
  
  // it's remote... go get it
  if (resource.service_url !== FB.service_url) {
    var args = {
      appid : appid,
      just_file : just_files,
      timestamp : timestamp
    };
    var url = acre.form.build_url(resource.appeditor_service_base + "get_app", args);
    return FB.fetch(url).result;
  }
  
  var ret;
  if (timestamp) {
    ret = make_graph_app({app_id:resource.appid, as_of:timestamp}, just_files);
  } else {
    var md = acre.get_metadata(resource.app_path);
    if (!md) { bad_appid(appid); }
    
    switch (md.__source__) {
      case "file" :
        ret = make_disk_app(md);
        ret.repository.url = "http://" + resource.acre_host;
        break;
      case "graph" :
      default :
        ret = make_graph_app(md, just_files);
        break;
    }    
  }
  
  ret.acre_host = resource.acre_host;
  ret.repository.appeditor_service_base = resource.appeditor_service_base;
  ret.current_file = resource.filename;

  return ret;
}


if (acre.current_script == acre.request.script) {    
  service.GetService(function() {
    var args = service.parse_request_args(['appid']);

    return get_app(args.appid, args.just_files, args.timestamp);
  }, this);
}
