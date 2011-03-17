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

// add headers to acre.urlfetch that affect caching

function acre_get(url) {
  
  var headers = {};
  
  ['pragma', 'cache-control', 'cookie'].forEach(function(h) {
    if (h in acre.request.headers) {
      headers[h] = acre.request.headers[h];
    }
  });
  
  return acre.urlfetch(url, "GET", headers);
}


function get_content(url, query) {
  try {
    if (typeof query != undefined && query && query.length > 0) {
      if (url.indexOf("?") > -1) {
        url = url.split("?")[0];
      }
      url += "?" + query;
    }
    
    var result = acre_get(url);
    var text = result.body;
    var content_type = result.headers['content-type'].split(';')[0];
    if (content_type == 'text/plain') {
      text = "&lt;pre&gt;" + text + "&lt;/pre&gt;";
    } else {
      var match = /\x3cbody(?:\s+[^\x3e]*)?\x3e([\s\S]*)\x3c\x2fbody\x3e/im.exec(text);
      if (match) { text = match[1]; }
                          }                     
    } catch(e) {
      text = "&lt;pre&gt;" + acre.html.encode(JSON.stringify(e.response || e, null, 2)) + "&lt;/pre&gt;";
    }
    return text;
}
    
    
function setup(path_info) {
  var categories = acre.require("doc_list").get_list();

  var request = acre.request;
  var query = request.query_string;
  // This is not used. Calling get_user_info makes pages that use this NOT cacheable
  //var user = acre.freebase.get_user_info();
  var sel_category;
  var sel_section;
  var path = path_info.split('/');
  // ignore leading /
  sel_category = path[1];
  sel_section  = path[2];

  sel_category = sel_category || categories[0].docs[0].key;
  
  var section_url;
  var doc_link;
  var doc_content;
  
  var header = "Developer Documentation";
  var title = "";

  for each (var category in categories) {
    for each (var doc in category.docs) {
      if (sel_category == doc.key) {
        if (doc.link) {
          acre.response.status = 301;
          acre.response.set_header("location", doc.link);
          acre.exit();
        }
        section_url = doc.sections || '';
        
        doc_link = doc.link;
        doc_content = doc.content;
        title += doc.name;
        

        if (section_url) {
          console.log(section_url);
          var feed = JSON.parse(acre_get(section_url).body);
          var sections = feed.contents;
          var sel_section = sel_section || (sections ? ("defaultSection" in feed ? sections[feed.defaultSection].key : sections[0].key) : null);
          for each (var section in sections) {
            if (sel_section == section.key) {
              title += " - " + section.name;
            }
          }
        }
      }        
    }
  }

  if (title == "") {
    title = header;
  }
  
  var o = {
    header : header,
    title : title,
    categories : categories,
    //user : user,
    sections : sections,
    section_url : section_url,
    sel_category : sel_category,
    sel_section : sel_section,
    doc_link : doc_link,
    doc_content : doc_content,
    query : query
  };
  
  return o;
};

  
