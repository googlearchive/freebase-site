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

var freebase = acre.require("promise/apis").freebase;
var h = acre.require("helper/helpers.sjs");

/**
 * Create a /common/document and optionally attach to a topic by the /common/topic/article property.
 * 
 * @param entity:String (required) - ID for the object to which the newly 
 *   created /common/document node should be linked by "/common/topic/article". 
 *   You can override using the default /common/topic/article property by
 *   specifying options.property.
 * @param content:String (required) - The content to upload.
 * @param content_type:String (required) - The MIME type of the content.
 * @param options:Object (optional) - Custom key/value options for the upload service
 *   - lang:String (optional) - lang ID. Defaults to /lang/en.
 *   - property:String (optional) - The property to use to attach the
 *        the newly created article to the entity. Defaults to /common/topic/article
 */
function create_article(entity, content, content_type, options) {
  options = options || {};
  var upload_options = {
      entity: entity,
      lang: h.lang_code(options.lang || "/lang/en")
  };
  if (options.property) {
      upload_options.property = options.property;
      // otherwise, text upload defaults to /common/topic/article
  }
  return freebase.upload(content, content_type, upload_options)
        .then(function(env) {
            return env.result;
        });
};
