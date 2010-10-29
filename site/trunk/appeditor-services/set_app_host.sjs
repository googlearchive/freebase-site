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

var hostpath = '/freebase/apps/hosts';
var default_hostpath = '/freebase/apps/hosts/com/freebaseapps';
var published_regex = /([^.]*)\.freebaseapps\.com$/;
    
var user;


function check_permission(versionid) {
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
    
    var check_permission = FB.mqlread(permission_query).result;
    if (check_permission === null) { throw "User does not have permission to register a host for this app"; }
}


function delete_all_hosts(appid, hosts) {
    var delete_old_hosts = [];
    var undeleted_hosts = [];
    
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
    
    if (delete_old_hosts.length) {
        // Don't sign so that the write user (appeditoruser)
        // credentials are used instead of the user's
        FB.mqlwrite(delete_old_hosts, null, {"http_sign" : false});
    }
    
    return undeleted_hosts;
}

    
function register_host(appid, hostname) {
    appid = service.parse_path(appid).appid;
        
    // Lets make absolutely sure we're working off the latest state of the graph
    FB.touch();

    if (typeof user === 'undefined') { user = service.check_user(); }

    var check_host = acre.require("check_host_availability").validate_host(hostname);
    var prev_app = check_host.id || null;
    
    var version_lib = acre.require('lib_app_versions');
    var app = version_lib.get_versions(appid);
    var versionid = app.release ? appid + '/' + app.release : appid;

    
    // make sure user has permissions on the app being registered
    // since we're using special write_user permissions for this
    check_permission(versionid);
    
    
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
        // Don't sign so that the write user (appeditoruser)
        // credentials are used instead of the user's
        FB.mqlwrite(delete_prev_app, null, {"http_sign" : false});
    }
    
    // delete all existing hosts on the default domain
    delete_all_hosts(appid, app.hosts); 
    
    // finally, add the new host
    var add_new_host = {
        id : versionid,
        key : {
            value : hostname,
            namespace : default_hostpath,
            connect : 'insert'
        }
    };
    // Don't sign so that the write user (appeditoruser)
    // credentials are used instead of the user's
    FB.mqlwrite(add_new_host, null, {"http_sign" : false});
    
    
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

      FB.mqlwrite(listing_write);
    }

    return version_lib.get_versions(appid);
}



if (acre.current_script == acre.request.script) {
    service.PostService(function() {
        var args = service.parse_request_args(['host', 'appid']);
        user = service.check_user();
            
        return register_host(args.appid, args.host);        
    }, this);
}
