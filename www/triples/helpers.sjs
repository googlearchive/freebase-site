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
var h = acre.require("lib/helper/helpers.sjs");

/**
 * return mqlread query for link
 */
function query(link) {
  var source = link.source || link["me:source"];
  var target = link.target || link["me:target"];
  var property = link.master_property.id;
  if (link.target_value) {
    target = link.target_value;
  }
  if (target.id) {
    target = {id:target.id};
  }
  else {
    var c = {value:target.value};
    if (target.lang) {
      c.lang = target.lang;
    }
    else if (target.namespace) {
      c.namespace = target.namespace;
    }
    target = c;
  }
  var q = {
    id: source.id
  };
  q[property] = target;
  if (!is_valid(link) && link.operation) {
    target.link = {
      valid: false,
      timestamp: null,
      operation: link.operation
    };
  }
  return q;
};

function is_valid(link) {
  return (link.valid === false) ? false : true;
};

function valid_class(link) {
  return is_valid(link) ? "valid": "invalid";
};

function link_class(link) {
  var operation = "";
  if (link.operation != null) {
    operation = " " + link.operation;
  }
  return h.trim(h.sprintf("hover-row %s%s", valid_class(link), operation));
};

/**
 * Get the css classes that specify what kind of links we are looking at
 * depending on the "object_type" and "current_tab". For example, for
 * "?instances for /type/property" we are looking at "Property Instances".
 */
function links_mode_class(object_type, current_tab) {
  return (current_tab + object_type.replace(/\//g, '-')).toLowerCase();
};
