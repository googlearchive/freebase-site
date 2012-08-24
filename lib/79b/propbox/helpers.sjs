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

var h = acre.require("helper/helpers.sjs");
var i18n = acre.require("i18n/i18n.sjs");
var validators = acre.require("validator/validators.sjs");

/*
  Returns a query string for provided property
*/
function build_query_url(topic_id, prop_structure, lang) {
  var q = {
    id: topic_id
  };
  q[prop_structure.id] = [];
  return h.fb_url("/queryeditor", {q:JSON.stringify(q), autorun:1});
};

/**
 * Assert truth otherwise throws validators.Invalid
 */
function assert(truth, msg) {
  if (!truth) {
    throw validators.Invalid.factory.apply(null, [msg]);
  }
};

/**
 * Return an input category name for an expected type id.
 * This is used by propbox.mjt data input components to specify
 * what kind of client-side (javascript) validation to perform.
 */
function data_input_type(type_id) {
  if (!type_id) {
    return "";
  }
  if (h.is_literal_type(type_id)) {
    return type_id.split("/").pop();
  }
  return "topic";
};

/**
 * Get the corresponding validator for a literal type.
 */
function literal_validator(type_id) {
  if (type_id === "/type/datetime") {
    return validators.Datetime;
  }
  else if (type_id === "/type/int") {
    return validators.Int;
  }
  else if (type_id === "/type/float") {
    return validators.Float;
  }
  else if (type_id === "/type/boolean") {
    return validators.StringBool;
  }
  else if (type_id === "/type/uri") {
    return validators.Uri;
  }
  else if (type_id === "/type/enumeration") {
    return validators.MqlKey;
  }
  else {
    return validators.String;
  }
};

/**
 * Transform a MQL property data result to a Topic API value.
 *
 * i.e. {id:..., text:..., lang:...} or {value:..., text:...}
 *
 * This is NOT recursive; it does NOT iterate over sub property values
 */
function minimal_prop_value(prop_structure, prop_data, lang) {
  if (!prop_data) {
    return null;
  }
  var value = {};
  var ect = prop_structure.expected_type;
  if (h.is_literal_type(ect.id)) {
    value.value = prop_data.value;
    value.text = ""+prop_data.value;
    if (prop_data.lang) {
      value.lang = prop_data.lang;
    }
    else if (prop_data.namespace) {
      value.namespace = prop_data.namespace;
    }
  }
  else {
    var name = prop_data.name;
    value.id = prop_data.id;
    if (name && name.length) {
      name = i18n.mql.get_text(lang, prop_data.name);
      value.text = name ? name.value : value.id;
      value.lang = name ? name.lang : null;
    }
    else {
      value.text = prop_data.id;
    }
  }
  return value;
};

/**
 * Transform a MQL prop schema to a prop structure optimized for rendering
 *
 * {
 *    id:
 *    text:
 *    lang:
 *    disambiguator:
 *    unique:
 *    unit*:
 *    expected_type: {
 *      id:
 *      text:
 *      lang:
 *      mediator*:
 *      enumeration*:
 *      included_types*:
 *    }
 * }
 *
 * (*) In addition, to the standard prop structure,
 * this adds additional schema hints 
 * (unit, mediator, enumeration, included_types).
 *
 * This is NOT recursive; it does NOT iterate over sub properties 
 * (expected_type.properties).
 * 
 * @see schema/typeloader.sjs
 */
function minimal_prop_structure(prop_schema, lang) {
  var name = i18n.mql.get_text(lang, prop_schema.name);
  var ect = prop_schema.expected_type;
  var ect_name = i18n.mql.get_text(lang, ect.name);
  var structure = {
    id: prop_schema.id,
    text: name ? name.value : prop_schema.id,
    lang: name ? name.lang : null,
    unique: prop_schema.unique === true,
    requires_permission: prop_schema.requires_permission === true,
    authorities: prop_schema.authorities || [],
    master_property: prop_schema.master_property,
    reverse_property: prop_schema.reverse_property,
    delegated: prop_schema.delegated,
    enumeration: prop_schema.enumeration,
    unit:
      prop_schema.unit ? {
          id: prop_schema.unit.id, 
          abbreviation:prop_schema.unit["/freebase/unit_profile/abbreviation"]
      } : null,
    disambiguator: 
      prop_schema["/freebase/property_hints/disambiguator"] === true,
    display_none: 
      prop_schema["/freebase/property_hints/display_none"] === true,
    deprecated:
      prop_schema["/freebase/property_hints/deprecated"] === true,
    expected_type: {
      id: ect.id,
      text: ect_name ? ect_name.value : ect.id,
      lang: ect_name ? ect_name.lang : null,
      mediator: ect["/freebase/type_hints/mediator"] === true,
      enumeration: ect["/freebase/type_hints/enumeration"] === true,
      never_assert: ect["/freebase/type_hints/never_assert"] === true,
      deprecated: ect["/freebase/type_hints/deprecated"] === true,
      included_types: ect["/freebase/type_hints/included_types"] || []
    }
  };
  var unit = prop_schema.unit;
  if (unit) {
    structure.unit = {
      id: unit.id,
      abbreviation: unit["/freebase/unit_profile/abbreviation"]
    };
  }
  if (prop_schema['emql:type']) {
      // emql properties are NOT edititable.
      structure.requires_permission = true;
      structure.authorities = [];
  }
  return structure;
};

/**
 * minimal_prop_structure + recursive into sub properties
 */
function to_prop_structure(prop_schema, lang, all) {
  var prop_structure = minimal_prop_structure(prop_schema, lang);
  var ect = prop_schema.expected_type;
  var subprops = ect.properties || [];
  if (subprops.length) {
    prop_structure.properties = [];
    var visible_subprops = h.get_visible_subprops(prop_schema, all);
    visible_subprops.forEach(function(subprop) {
      prop_structure.properties.push(to_prop_structure(subprop, lang));
    });
  }
  return prop_structure;
};

/**
 * Convert MQL query results (prop_data) to Topic API values format.
 *
 * {
 *   ...
 *   "/prop/id": {
 *     ...
 *     values: [...]
 *   }
 * }
 */
function to_prop_values(prop_structure, prop_data, lang) {
  prop_data = prop_data || [];
  if (prop_data != null && !h.isArray(prop_data)) {
    prop_data = [prop_data];
  };
  if (prop_structure.unique && 
      lang && prop_structure.expected_type.id === "/type/text") {
    var data = i18n.mql.get_text(lang, prop_data);
    if (data == null) {
      return [];
    }
    return [minimal_prop_value(prop_structure, data, lang)];
  }
  var values = [];
  for (var i=0,l=prop_data.length; i<l; i++) {
    var data = prop_data[i];
    var value = minimal_prop_value(prop_structure, data, lang);
    values.push(value);
    var subprop_structures = prop_structure.properties || [];
    for (var j=0,k=subprop_structures.length; j<k; j++) {
      var subprop_structure = subprop_structures[j];
      var subprop_data = data[subprop_structure.id];
      if (subprop_data.length) {
        if (!value.property) {
          value.property = {};
        }
        value.property[subprop_structure.id] = 
              {values:to_prop_values(subprop_structure, subprop_data, lang)};
      }
    }
  }
  return values;
};

function mqlread_query(topic_id, prop_structure, prop_value, lang, namespace, options) {
  var clause = {
    id: topic_id
  };
  var prop_clause = mqlread_clause(prop_structure, prop_value, lang, namespace, options);
  var properties = prop_structure.properties;
  if (properties) {
    properties.forEach(function(subprop_structure) {
      h.extend(prop_clause[0], 
               mqlread_query(prop_value, subprop_structure, null, lang));
      if (topic_id && h.is_reciprocal(prop_structure, subprop_structure)) {
        // don't get the subject id (topic_id) if subprop_structure 
        // is a reciprocal property of prop_structure
        prop_clause[0][subprop_structure.id][0]["id!="] = topic_id;
      }
    });
  }
  clause[prop_structure.id] = prop_clause;
  return clause;
};


function mqlread_clause(prop_structure, prop_value, lang, namespace, options) {
  var ect = prop_structure.expected_type;
  var is_literal = h.is_literal_type(ect.id);
  var clause = {optional:true};
  if (is_literal) {
    if (ect.id == "/type/text") {
      if (lang) {
        clause = i18n.mql.text_clause(lang)[0];
      }
      else {
        clause.lang = null;
      }
    }
    else if (ect.id === "/type/key") {
        clause.namespace = namespace || null;
    }
    clause.value = literal_validator(ect.id)(prop_value, {if_empty:null});
  }
  else {
    clause.id = prop_value;
    if (!ect.mediator) {
      if (lang) {
        clause.name = i18n.mql.text_clause(lang);
      }
      else {
        clause.name = [{value:null, lang:null, optional:true}];
      }
    }
  }
  return [h.extend(clause, options)];
};


/**
 * Currently, properties with
 * 
 * 1. requires_permission == TRUE and 
 * 2. authorities == EMPTY
 * 
 * are NOT editable.
 */
function is_property_editable(prop_structure) {
    if (prop_structure.requires_permission === true) {
        if (prop_structure.authorities === null ||
            prop_structure.authorities.length === 0) {
            return false;
        }
    }
    return true;
};
