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
var h = acre.require("lib/helper/helpers.sjs");
var rh = acre.require("lib/routing/helpers.sjs");
var validators = acre.require("lib/validator/validators.sjs");

var path_info = rh.normalize_path(this);

var result;

// is path_info a valid mql id?
var id = validators.MqlId(path_info, {if_invalid:null});
if (id) {
  /**
   * MQL to determine if this topic is viewable by topic/view,
   * otherwise, redirect to associated views
   */
  var q = {
    id: id,
    type: {
      id: null,
      "id|=": ["/type/domain", "/type/type", "/type/property"]
    }
  };
  try {
    result = acre.freebase.mqlread(q).result;
  }
  catch (e) {
    result = null;
  }
}

if (result) {
  var type = result.type.id;
  if (type === "/type/domain") {
    rh.route(this, "domain.controller", id);
  }
  else if (type === "/type/type") {
    rh.route(this, "/type.controller", id);
  }
  else {
    rh.route(this, "/property.controller", id);
  }
}
else {
  rh.route(this, path_info);
}
