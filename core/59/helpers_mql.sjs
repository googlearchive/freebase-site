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

var exports = {
  "is_literal_type": is_literal_type,
  "get_type_role": get_type_role,
  "get_object_kind": get_object_kind
};

var mf = acre.require("MANIFEST").mf;
var _ = mf.require("i18n", "i18n").gettext;

var LITERAL_TYPE_IDS = {
  "/type/int":1,
  "/type/float":1,
  "/type/boolean":1,
  "/type/rawstring":1,
  "/type/uri":1,
  "/type/text":1,
  "/type/datetime":1,
  "/type/bytestring":1,
  "/type/id":1,
  "/type/key":1,
  "/type/value":1,
  "/type/enumeration":1
};
function is_literal_type(type_id) {
  return  LITERAL_TYPE_IDS[type_id] === 1;
};

/**
 * Get the type role looking at type hints,
 * /freebase/type_hints/mediator,
 * /freebase/type_hints/enumeration.
 *
 * @param type:Object (required)
 * @param set:Boolean (optional) - Set type[mediator|enumeration] if TRUE
 */
function get_type_role(type, set) {
  var role = {
    mediator: type["/freebase/type_hints/mediator"] === true,
    enumeration: type["/freebase/type_hints/enumeration"] === true
  };
  if (set) {
    type.mediator = role.mediator;
    type.enumeration = role.enumeration;
  }
  return role;
};


/**
 * Receive an object and it's list of types
 * return most relevant one
 * @param topic:Object (required)
 * @param types:Array (optional) - If not specified, use topic.type otherwise use this list of types
 */
function get_object_kind(topic, types) {
  types = types || topic.type || [];
  var map = {};
  for (var i=0,l=types.length; i<l; i++) {
    map[types[i].id] = types[i];
  };
  if ("/freebase/apps/acre_app" in map) {
    return _("Acre App");
  }
  else if ("/type/domain" in map) {
    if (topic.id.indexOf("/base/") === 0 || topic.id.indexOf("/user/") === 0) {
      return _("User Domain");
    }
    else {
      return _("Domain");
    }
  }
  else if ("/type/user" in map) {
    return _("User");
  }
  else if ("/type/namespace" in map) {
    return _("Namespace");
  }
  else if ("/type/type" in map) {
    var role = get_type_role(topic);
    if (role.mediator) {
      return _("Mediator");
    }
    else if (role.enumeration) {
      return _("Enumerated Type");
    }
    else {
      return _("Type");
    }
  }
  else if ("/freebase/query" in map) {
    return _("Collection");
  }
  else if ("/type/property" in map) {
    return _("Property");
  }
  else if ("/common/image" in map) {
    return _("Image");
  }
  else if ("/common/document" in map) {
    return _("Article");
  }
  else if ("/common/topic" in map) {
    return _("Topic");
  }
  return "";
};

