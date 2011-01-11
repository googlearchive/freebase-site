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

function shorten(url) {
  var response = acre.urlfetch("http://tinyurl.com/api-create.php?url=" + url);
  return response.body;
  /*
  var body = acre.form.encode({ "url" : url, "alias" : "", "submit" : "Make TinyURL!" });
  var response = acre.urlfetch(
     "http://tinyurl.com/create.php", 
     "POST",
     { "Content-Length" : body.length.toString() },
     body
  );
  
  var html = response.body;
  var marker = 'href="http://preview.tinyurl.com/';
  var start = html.indexOf(marker);
  var end = html.indexOf('"', start + marker.length);
  var id = html.substring(start + marker.length, end);
  
  return html;//'http://tinyurl.com/' + id;
  */
}

function process() {
  var url;
  
  var base_url = acre.request.params["base_url"];
  if (base_url != null) {
    url = base_url + "?";
  } else {
    url = acre.request.app_url + "/queryeditor?"
  }
  
  var q = acre.request.params["q"];
  if (q != null && q.length > 0) {
    url = url + "q=" + encodeURIComponent(q);
  } else {
    var r = acre.request.params["r"];
    if (r != null && r.length > 0) {
      url = url + "r=" + encodeURIComponent(r);
    }
  }
  if ("as_of_time" in acre.request.params) {
    url = url + "&as_of_time=" + encodeURIComponent(acre.request.params["as_of_time"]);
  }
  if (acre.request.params["emql"] == "1") {
    url = url + "&emql=1";
  }
  if ("debug" in acre.request.params) {
    url = url + "&debug=" + encodeURIComponent(acre.request.params["debug"]);
  }
  if ("service" in acre.request.params) {
    url = url + "&service=" + encodeURIComponent(acre.request.params["service"]);
  }
  if ("env" in acre.request.params) {
    url = url + "&env=" + encodeURIComponent(acre.request.params["env"]);
  }
  if ("autorun" in acre.request.params) {
    url = url + "&autorun=" + encodeURIComponent(acre.request.params["autorun"]);
  }
 
  try {
    acre.write(JSON.stringify(shorten(url)));
  } catch (e) {
    acre.write(e.toString());
  }
}

if (acre.environ.request_method != "POST") {
  acre.start_response(500);
  acre.write(JSON.stringify({ "status" : 500, "error" : "HTTP GET not supported." }));
} else {
  var callback = acre.environ.params["callback"];
  acre.start_response(200);
  if (callback) {
    acre.write(callback + "(");
  }
  process();
  if (callback) {
    acre.write(")");
  }
}