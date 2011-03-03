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
  "is_schema_app": is_schema_app,
  "is_inspect_app": is_inspect_app,
  "is_topic_app": is_topic_app,
  "is_group_app": is_group_app,
  "fb_input_type": fb_input_type
};

var mql = acre.require("helper/helpers_mql.sjs");

var schema_app = /^\/\/(\w+\.)*schema\.www\./;
var inspect_app = /^\/\/(\w+\.)*triples\.www\./;
var topic_app = /^\/\/(\w+\.)*topic\.www\./;
var group_app = /^\/\/(\w+\.)*group\.www\./;


function is_schema_app(app_path) {
  return schema_app.test(app_path);
};

function is_inspect_app(app_path) {
  return inspect_app.test(app_path);
};

function is_topic_app(app_path) {
  return topic_app.test(app_path);
};

function is_group_app(app_path) {
  return group_app.test(app_path);
};


function fb_input_type(type_id) {
  if (mql.is_literal_type(type_id)) {
    return type_id.split("/").pop();
  }
  else if (type_id === "/freebase/type_hints/enumeration") {
    return "enumerated";
  }
  return "topic";
};


/**
 * Receive an object and it's list of types
 * return most relevant one
 * @param topic:Object (required)
 * @param types:Array (optional) - If not specified, use topic.type otherwise use this list of types
 */
/**
var _ = acre.require("i18n/i18n").gettext;

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
**/
