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

var mf = acre.require("MANIFEST").mf;
var docs_base = acre.request.app_url + "/docs";

// could not use h.url_for because it requires the app to in core/MANIFEST, not the local manifest
// var h = mf.require("core", "helpers");

function url_for(app,file) {
  if (!(app in mf.apps)) { console.error('Could not find '+app+' in mf.apps:',mf.apps); return null; }
  var url = acre.host.protocol + ":" + mf.apps[app] + "." + acre.host.name + 
            (acre.host.port !== 80 ? (":" + acre.host.port) : "") + (file ? "/" + file : "");
  return url;
}

function get_list() {
  return [
    {
      "name" : "APIs",
      "docs" : [
        {
          "name"     : "Freebase Overview",
          "key"      : "data",
          "sections" : url_for("datadocs", "sections_getting_started" )
        },
        {
          "name"     : "MQL Reference",
          "key"      : "mql",
          "sections" : url_for("mql","sections_new?base="+ acre.request.base_path) // XXX: what is base_path used for?
        },
        {
          "name"     : "MQL Read",
          "key"      : "mqlread",
          "content": docs_base + "/web_service/en/api_service_mqlread"
        },
        {
          "name"     : "MQL Write",
          "key"      : "mqlwrite",
          "content"  : docs_base + "/web_service/en/api_service_mqlwrite"
        },
        {
          "name"     : "MQL Extensions",
          "key"      : "mql_extensions",
          "sections" : docs_base + "/mql_extensions_list"
        },
        {
          "name"     : "Topic API",
          "key"      : "topic_api",
          "sections" : url_for("libtopic", "doc_sections")
        },
        {
          "name"     : "All Web Service APIs",
          "key"      : "web_services",
          "sections" : docs_base + "/web_services_list"
        }
      ]
    },
    {
      "name" : "Widgets",
      "docs" : [
        {
          "name"     : "Freebase Suggest",
          "key"      : "suggest",
          "content"  : mf.lib_base_url('suggest') + "/index.html"
        }
      ]
    },
    {
      "name" : "Acre",
      "docs" : [
        {
          "name"     : "Acre Overview",
          "key"      : "acre",
          "sections" : url_for("acredocs", "sections")
        },
        {
          "name"     : "Template Reference",
          "key"      : "acre_templates",
          "sections" : url_for("mjt", "sections")
        },
        {
          "name"     : "API Reference",
          "key"      : "acre_api",
          "sections" : url_for("acreassist", "sections")
        },
        {
          "name"     : "Javascript Reference",
          "key"      : "js_reference",
          "sections" : url_for("jscheatsheet", "sections"),
          "hidden"   : true // only show if requested directly (by app editor)
        }
      ]
    }
  ];
}

if (acre.current_script == acre.request.script) {
    acre.write(JSON.stringify(get_list(), null, 2));
}
