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
