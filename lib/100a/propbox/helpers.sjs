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

/**
 * Assert truth otherwise throws validators.Invalid
 */
function assert(truth, msg) {
  if (!truth) {
    throw validators.Invalid.factory.apply(null, [msg]);
  }
}

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
}

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
}

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
  if (prop_data.link && prop_data.link.creator) {
    value.creator = prop_data.link.creator;
  }

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
    if (h.isArray(prop_data.type) && prop_data.type.length) {
      value.type = prop_data.type.slice();
    }
  }
  return value;
}

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
    schema: prop_schema.schema,
    unique: prop_schema.unique === true,
    requires_permission: prop_schema.requires_permission === true,
    authorities: prop_schema.authorities,
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
  if (structure.authorities) {
    // flatten members for easy look up
    var members = {};
    structure.authorities.permits.forEach(function(usergroup) {
      usergroup.member.forEach(function(member) {
        members[member.id] = h.id_key(member.id);
      });
    });
    structure.authorities["members"] = members;
  }
  return structure;
}

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
}

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
  }
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
}

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
  // For subproperties with expected_type /type/key we can't ask for an id
  if (prop_structure.expected_type.id === '/type/key') {
    delete prop_clause[0].id;
  }
  return clause;
}


function mqlread_clause(prop_structure, prop_value, lang, namespace, options) {
  var ect = prop_structure.expected_type;
  var is_literal = h.is_literal_type(ect.id);
  var clause = {
    optional:true
  };
  if (h.supports_link_property(prop_structure.id)) {
    clause.link = {
      creator: null
    };
  }
  if (is_literal) {
    if (ect.id == "/type/text") {
      if (lang) {
        clause = h.extend(i18n.mql.text_clause(lang)[0], clause);
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
    if (prop_value != null) {
      clause.type = [{
        id: null,
        optional: true
      }];
    }
  }
  return [h.extend(clause, options)];
}

/**
 * A property requires permission/authorization
 * if /type/property/requries_permission is
 * TRUE or /type/property/authorities is not NULL.
 * @param {object} prop_structure The property structure.
 *   @see minimal_prop_structure.
 * @return {boolean} TRUE if the property requires permission otherwise FALSE.
 */
function property_requires_permission_or_authorities(prop_structure) {
  return prop_structure.requires_permission === true ||
      !(prop_structure.authorities == null ||
        h.isEmptyObject(prop_structure.authorities.members));
}


/**
 * A helper to return all the css classes for a propbox data-row.
 * @param {object} prop_structure The property structure.
 *   @see minimal_prop_structure.
 * @param {object} prop_value The value object with a creator.
 * @return {string} A string of all css classes of the data-row.
 *   If the property requires permission, this will include
 *   'data-row-requires-permission' as a css class. If the creator of the
 *   prop_value is an authority, this will include
 *   'data-row-creator-<username>' as a css class. This will always include
 *  'kbs' and 'data-row' as css classes.
 */
function get_propbox_data_row_css_class(prop_structure, prop_value) {
  var css = ['kbs data-row hover-row'];
  if (property_requires_permission_or_authorities(prop_structure)) {
    css.push('data-row-requires-permission');
  }
  if (is_authority(prop_structure, prop_value.creator)) {
    css.push('data-row-creator-' + h.id_key(prop_value.creator));
  }
  return css.join(' ');
}


/**
 * Can the specified user assert a new value to the property?
 * @param {string} user_id The user id.
 * @param {object} prop_structure The property structure with
 *   requires_permission and authorities.
 * @return {boolean} TRUE if the user can add, otherwise return FALSE.
 */
function user_can_add(user_id, prop_structure) {
  if (prop_structure.authorities == null) {
    if (prop_structure.requires_permission === true) {
      // authorities=null, requires_permission=true
      // Unwritable by any user.
      return false;
    }
    else {
      // authorities=null, requires_permission=false|null
      // Any triple can be added or deleted by any user,
      // modulo object permissions (standard Freebase case).
      return true;
    }
  }
  else {
    if (prop_structure.requires_permission === true) {
      // authorities=foo, requires_permission=true
      // Only a member of the foo permission can assert or
      // delete triples for this property ("computed" property).
      if (is_authority(prop_structure, user_id)) {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      // authorities=foo, requires_permission=false|null
      // Any user can assert triples for this property,
      // but triples created by a member of the foo permission
      // can can only be deleted by the same user who created it.
      return true;
    }
  }
}


/**
 * Can the specified user edit or delete an exiting property value?
 * @param {string} user_id The user id.
 * @param {object} prop_structure The property structure with
 *   requires_permission and authorities.
 * @param {object} value The value object with a value['creator'].
 * @return {boolean} TRUE if the user can edit the value,
 *   otherwise return FALSE.
 */
function user_can_edit(user_id, prop_structure, prop_value) {
  if (prop_structure.authorities == null) {
    if (prop_structure.requires_permission === true) {
      // authorities=null, requires_permission=true
      // Unwritable by any user.
      return false;
    }
    else {
      // authorities=null, requires_permission=false|null
      // Any triple can be added or deleted by any user,
      // modulo object permissions (standard Freebase case).
      return true;
    }
  }
  else {
    if (prop_structure.requires_permission === true) {
      // authorities=foo, requires_permission=true
      // Only a member of the foo permission can assert or
      // delete triples for this property ("computed" property).
      if (is_authority(prop_structure, user_id)) {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      // authorities=foo, requires_permission=false|null
      // Any user can assert triples for this property,
      // but triples created by a member of the foo permission
      // can can only be deleted by the same user who created it.
      if (prop_value.creator) {
        if (is_authority(prop_structure, user_id)) {
          return prop_value.creator === user_id;
        }
        else {
          // (Dae) Is this true? Anyone should able to edit/delete the value
          // they asserted?
          return prop_value.creator === user_id;
        }
      }
      else {
        return false;
      }
    }
  }
}


/**
 * Is user an authority of the specified property?
 * Check if the prop_value creator is an
 * authority or member of the permission specified by its
 * '/type/property/authorities'.
 * @param {object} prop_structure The property structure.
 *   @see minimal_prop_structure.
 * @param {string} The user id.
 * @return {boolean} If the user_id is an authority on the property.
 */
function is_authority(prop_structure, user_id) {
  if (prop_structure.authorities &&
      prop_structure.authorities.members) {
    return user_id in prop_structure.authorities.members;
  }
  return false;
}

/**
 * Is given type asserted?
 * @param {object} topic The Topic structure
 * @param {object} type_structure The type structure.
 * @return {Boolean} if the property is bare property
 */
function is_asserted_type(topic, type_structure) {
  var t = type_structure.id;
  if (t === '/type/object') {
    return false;
  }
  var asserted = true;
  var values = h.get_values(topic, "/type/object/type");
  if (values == null) {
    asserted = false;
  }
  else {
    asserted = values.some(function(val){
      return t === val.id;
    });
  }
  return asserted;
}

/**
 * Get status object for given property
 * @param  {object} topic          Topic structure
 * @param  {object} prop_structure Property structure
 * @param  {array} prop_values     Property values
 * @return {object}                Object with fields is_empty, has_status,
 *                                 has_value, has_no_value, unique_edit
 */
function get_property_status(topic, prop_structure, prop_values) {
  var prop = h.get_property(topic, prop_structure.id);
  var empty = !prop_values || !prop_values.length;
  var status = prop && prop.status;
  var unique_edit = (prop && prop.unique && !empty) ? true : false;
  return {
    is_empty: empty,
    has_status: status != null,
    has_value: status === "has_value" || false,
    has_no_value: status === "has_no_value" || false,
    unique_edit: unique_edit
  };
}
