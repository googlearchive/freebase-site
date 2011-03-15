7/*
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
  "to_literal_value": to_literal_value,
  "get_type_role": get_type_role,
  "is_reciprocal": is_reciprocal,
  "visible_subprops": visible_subprops
};

var LITERAL_TYPE_IDS = {
  "/type/int":1,
  "/type/float":1,
  "/type/boolean":1,
  "/type/rawstring":1,
  "/type/uri":1,
  "/type/text":1,
  "/type/datetime":1,
  "/type/id":1,
  "/type/key":1,
  "/type/value":1,
  "/type/enumeration":1
};
function is_literal_type(type_id) {
  return  LITERAL_TYPE_IDS[type_id] === 1;
};

function to_literal_value(type_id, value /** string **/) {
  if (type_id === "/type/text") {
    return value;
  }
  else if (type_id === "/type/int") {
    return parseInt(value, 10);
  }
  else if (type_id === "/type/float") {
    return parseFloat(value);
  }
  else if (type_id === "/type/boolean") {
    var b = value.toLowerCase();
    return b === "true" || b === "yes";
  }
  else {
    return value;
  }
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


function is_reciprocal(prop1, prop2) {
  if (!prop2) {
    return prop1["reverse_property"] || prop1["master_property"];
  }

  //console.log("is_reciprocal", prop1, prop2);

  var otherprop = is_reciprocal(prop1);
  if (otherprop) {
    if (otherprop.id == prop2.id) {
      return true;
    }
    else if (prop2.delegated) {
      if (otherprop.id == prop2.delegated.id) {
        return true;
      }
    }
  }
  otherprop = is_reciprocal(prop2);
  if (otherprop) {
    if (otherprop.id == prop1.id) {
      return true;
    }
    else if (prop1.delegated) {
      if (otherprop.id == prop1.delegated.id) {
        return true;
      }
    }
  }
  return false;
};

function visible_subprops(prop, subprops) {
  if (!subprops) {
    subprops = prop.expected_type.properties;
  }
  var visible = [];
  subprops.forEach(function(subprop, i) {
    if (subprop.unique && is_reciprocal(prop, subprop)) {
      return;
    }
    if (unique_ish(subprop.id)) {
      subprop.unique = true;
    }
    visible.push(subprop);
  });
  return visible;
};

function unique_ish(prop_id) {
  return unique_ish.map[prop_id] === 1;
};

unique_ish.map = (function() {
  var map = {};
  [
    '/people/sibling_relationship/sibling', '/people/marriage/spouse',
    '/fictional_universe/sibling_relationship_of_fictional_characters/siblings',
    '/fictional_universe/marriage_of_fictional_characters/spouses'
  ].forEach(function(pid) {
    map[pid] = 1;
  });
  return map;
})();


