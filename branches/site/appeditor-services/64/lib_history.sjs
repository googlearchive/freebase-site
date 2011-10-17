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


function get_history(id, limit, for_app, exclude_user) {    
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
        ret.appid = service.parse_path(id).appid;
        FB.extend_query(q, {
            "source.key": {
              "value":     null,
              "namespace": ret.appid
            }
        });
    } else {
        ret.fileid = service.parse_path(id, {file:true}).id;
        FB.extend_query(q, {
            "source.id" : ret.fileid
        });
    }
    
    if (exclude_user) {
        FB.extend_query(q, {
           "exclude:attribution" : {
               "id" : "/user/" + exclude_user,
               "optional" : "forbidden"
           } 
        });
    }
    
    var result = FB.mqlread(q).result;
    
    var list = [];
    for each (var rev in result) {
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
}
