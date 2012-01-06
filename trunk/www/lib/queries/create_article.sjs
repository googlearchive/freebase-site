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

var freebase = acre.require("promise/apis").freebase;
var h = acre.require("helper/helpers.sjs");

/**
 * Create a /common/document and optionally attach to a topic by the /common/topic/article property.
 *
 * @param content (string, required) - The content to upload.
 * @param content_type (string, required) - The MIME type of the content.
 * @param options (obj, optional) - Custom key/value options for the upload service
 *   - use_permission_of (string, optional) - ID for the object whose permission the
 *                                            /common/document object should have.
 *   - topic (string, optional) - ID for the object to which the /common/document object
 *                                should be linked by "/common/topic/article"
 *   - lang (string, optional) - lang ID (i.e., /lang/en)
 *   - prop (object, optional) - The property to use to attach the
 *        the newly created article to the topic. This should be a full property
 *        schema as returned by lib/schema/proploader.sjs.
 */
function create_article(content, content_type, options) {
  options = options || {};
  // assert options.prop expected type is /common/document
  if (options.prop && options.prop.expected_type && 
      options.prop.expected_type.id !== "/common/document") {
    return deferred.rejected("create_article expects a property whose expected_type is /common/document");
  }
  var q = {
    id: null,
    type: "/common/document",
    create: "unconditional"
  };
  // freebase.mqlwrite specific options
  var mqlwrite_options = {};
  ["use_permission_of"].forEach(function(option) {
    if (option in options) {
      mqlwrite_options[option] = options[option];
    }
  });
  return freebase.mqlwrite(q, mqlwrite_options)
    .then(function(env) {
      return env.result;
    })
    .then(function(doc) {
      var upload_options = {
        document: doc.id
      };
      if (options.lang) {
        // freebase.upload expects lang codes NOT lang ids
        upload_options.lang = h.lang_code(options.lang);
      }
      return freebase.upload(content, content_type, upload_options)
        .then(function(env) {
          return env.result;
        })
        .then(function(uploaded) {
          // upload does not return language buganizer# 5828169
          uploaded["/type/content/language"] = 
            uploaded["language"] = h.lang_id(options.lang || "/lang/en");
          h.extend(doc, {"/common/document/content": uploaded});
          return doc;           
        });
    })
    .then(function(doc) {
      if (options.topic) {
        q = {
          id: options.topic
        };
        if (options.prop) {
          q[options.prop.id] = {
            id: doc.id,
            connect: options.prop.unique ? "replace" : "insert"
          };
        }
        else {
          q["/common/topic/article"] = {
            id: doc.id,
            connect: "insert"
          };
        };
        return freebase.mqlwrite(q)
          .then(function() {
            return doc;
          });
      }
      return doc;
    });
};
