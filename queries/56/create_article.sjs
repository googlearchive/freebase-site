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
var freebase = mf.require("promise", "apis").freebase;
var h = mf.require("core", "helpers");

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
 */
function create_article(content, content_type, options) {
  options = options || {};
  var q = {
    id: null,
    type: "/common/document",
    create: "unconditional"
  };
  return freebase.mqlwrite(q, options)
    .then(function(env) {
      return env.result;
    })
    .then(function(doc) {
      return upload(content, content_type, h.extend({}, options, {document:doc.id}))
        .then(function(uploaded) {
          h.extend(doc, {"/common/document/content": uploaded});
          return doc;
        });
    })
    .then(function(doc) {
      if (options.topic) {
        q = {
          id: options.topic,
          "/common/topic/article": {
            id: doc.id,
            connect: "insert"
          }
        };
        return freebase.mqlwrite(q)
          .then(function() {
            return doc;
          });
      }
      return doc;
    });
};

/**
 * Upload new content.
 * If options.lang is specified, this will set /type/content/language on the uploaded content.
 */
function upload(content, content_type, options) {
  options = options || {};
  return freebase.upload(content, content_type, options)
    .then(function(env) {
      return env.result;
    })
    .then(function(uploaded) {
      if (options.lang) {
        // upload service does not accept content-language parameter
        var q = {
          id: uploaded.id,
          "/type/content/language": {id:options.lang, connect:"update"}
        };
        return freebase.mqlwrite(q)
          .then(function() {
            uploaded["/type/content/language"] = options.lang;
            return uploaded;
          });
      }
      else {
        return uploaded;
      }
    });
};
