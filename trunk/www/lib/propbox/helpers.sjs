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

var h = acre.require("helper/helpers.sjs");
var i18n = acre.require("i18n/i18n.sjs");
var validators = acre.require("validator/validators.sjs");

/*
  Returns a query string for provided property
*/
function build_query_url(topic_id, prop_structure, lang) {
  var q = mqlread_query(topic_id, prop_structure, null, lang);
  return h.fb_url("/queryeditor", {autorun: true, q: JSON.stringify(q)});
};

/**
 * Assert truth otherwise throws validators.Invalid
 */
function assert(truth, msg) {
  if (!truth) {
    throw validators.Invalid.factory.apply(null, [msg]);
  }
};

function data_input_type(type_id) {
  if (!type_id) {
    return "";
  }
  if (h.is_literal_type(type_id)) {
    return type_id.split("/").pop();
  }
  else if (type_id === "/freebase/type_hints/enumeration") {
    return "enumerated";
  }
  return "topic";
};

/**
 * Transform property schema (mql) to the property structure returned by the topic api.
 * If prop_data is specified, convert prop data query result (mql)
 * into prop_structure.values (topic api).
 */
function to_prop_structure(prop_schema, prop_data, lang) {
  var structure = minimal_prop_structure(prop_schema, lang);
  var is_cvt =  prop_schema.expected_type["/freebase/type_hints/mediator"] === true;
  var visible_subprops;
  if (is_cvt) {
    var properties = structure.properties = [];
    visible_subprops = h.visible_subprops(prop_schema);
    visible_subprops.forEach(function(subprop_schema) {
      properties.push(minimal_prop_structure(subprop_schema, lang));
    });
  }
};

function to_prop_values(prop_structure, prop_data, lang) {
  prop_data = prop_data || [];
  if (!h.isArray(prop_data)) {
    prop_data = [prop_data];
  };
  var values = [];
  if (prop_structure.expected_type.mediator) {
    prop_data.forEach(function(data, i) {
      var value = {
        id: data.id
      };
      prop_structure.properties.forEach(function(subprop_structure, j) {
        var subvalues = value[subprop_structure.id] = {values:[]};
        var subprop_data = data[subprop_structure.id] || [];
        if (!h.isArray(subprop_data)) {
          subprop_data = [subprop_data];
        }
        subprop_data.forEach(function(subdata) {
          var prop_value = minimal_prop_value(subprop_structure, subdata, lang);
          subvalues.values.push(prop_value);
        });
      });
      values.push(value);
    });
  }
  else {
    prop_data.forEach(function(data, i) {
      var prop_value = minimal_prop_value(prop_structure, data, lang);
      values.push(prop_value);
    });
  }
  return values;
};

function minimal_prop_value(prop_structure, prop_data, lang) {
  var value = {};
  var ect = prop_structure.expected_type;
  if (h.is_literal_type(ect.id)) {
    value.value = prop_data.value;
    value.text = prop_data.value;
    if (prop_data.lang) {
      value.lang = prop_data.lang;
    }
  }
  else {
    var name = prop_data.name;
//    assert(h.isArray(name), "minimal_prop_value: expected prop_data.name to be an array of lang values");
    value.id = prop_data.id;
    if (name && name.length) {
      name = i18n.mql.get_text(lang, prop_data.name);
      value.text = name.value;
      value.lang = name.lang;
    }
    else {
      value.text = prop_data.id;
    }
  }
  return value;
};

/**
 * Transform mql prop schema (@see propbox/mql.sjs") to prop structure returned by topic api.
 */
function minimal_prop_structure(prop_schema, lang) {
  var name = i18n.mql.get_text(lang, prop_schema.name);
  var ect = prop_schema.expected_type;
  var ect_name = i18n.mql.get_text(lang, ect.name);
  var structure = {
    id: prop_schema.id,
    text: name.value,
    lang: name.lang,
    disambiguator: prop_schema["/freebase/property_hints/disambiguator"] === true,
    unique: prop_schema.unique === true,
    expected_type: {
      id: ect.id,
      text: ect_name.value,
      lang: ect_name.lang,
      mediator: ect["/freebase/type_hints/mediator"] === true,
      enumeration: ect["/freebase/type_hints/enumeration"] === true,
      included_types: ect["/freebase/type_hints/included_types"] || []
    }
  };
  if (prop_schema.unit) {
    var unit_name = i18n.mql.get_text(lang, prop_schema.unit.name);
    structure.unit = {
      id: prop_schema.unit.id,
      text: unit_name.value,
      lang: unit_name.lang,
      abbreviation: prop_schema.unit["/freebase/unit_profile/abbreviation"]
    };
  }
  if (ect["/freebase/type_hints/mediator"]) {
    var properties = structure.properties = [];
    var visible_subprops = h.visible_subprops(prop_schema);
    visible_subprops.forEach(function(subprop_schema) {
      properties.push(minimal_prop_structure(subprop_schema, lang));
    });
  }
  return structure;
};

/**
 * Generate a mqlwrite query.
 */
function mqlwrite_query(topic_id, prop_structure, params, lang) {
  if (prop_structure.expected_type.mediator) {
    return mqlwrite_cvt(topic_id, prop_structure, params, lang);
  }
  else {
    return mqlwrite_object(topic_id, prop_structure, params, lang);
  }
};

/**
 * Generate a mqlwrite query for cvt.
 */
function mqlwrite_cvt(topic_id, prop_structure, params, lang) {
  var ect = prop_structure.expected_type;
  var clause = {
    id: topic_id
  };
  var sub_clause = {
    id: null,
    type: [{
      id: ect.id
    }],
    create: "unconditional",
    connect: prop_structure.unique ? "update": "insert"
  };
  ect.included_types.forEach(function(t) {
    sub_clause.type.push({id:t});
  });
  prop_structure.properties.forEach(function(subprop_structure) {
    var subprop_id = subprop_structure.id;
    if (params[subprop_id]) {
      sub_clause[subprop_id] = mqlwrite_clause(subprop_structure, params, lang);
    }
  });
  clause[prop_structure.id] = [sub_clause];
  return clause;
};

/**
 * Generate a mqlwrite query for a simple property assertion.
 */
function mqlwrite_object(topic_id, prop_structure, params, lang) {
  var clause =  {
    id: topic_id
  };
  clause[prop_structure.id] = mqlwrite_clause(prop_structure, params, lang);
  return clause;
};

/**
 * Generate a mqlwrite clause.
 * The write clause will always be an array with >= 1 assertions.
 */
function mqlwrite_clause(prop_structure, params, lang) {
  var object_values;
  var ect = prop_structure.expected_type;
  var is_literal = h.is_literal_type(ect.id);
  if (is_literal) {
    object_values = validators.MultiValue(params, prop_structure.id, {
      required: true,
      validator: literal_validator(ect.id)
    });
  }
  else {
    object_values = validators.MultiValue(params, prop_structure.id, {
      required: true,
      validator: validators.MqlId
    });
  }
  assert(object_values.length, "mqlwrite_clause: nothing to write for " + prop_structure.id);
  if (prop_structure.unique) {
    assert(object_values.length === 1, "mqlwrite_clause: can't write multiple values for unique property " + prop_structure.id);
  }
  var clauses = [];
  var is_text = ect.id === "/type/text";
  object_values.forEach(function(object_value) {
    var clause = {
      connect: prop_structure.unique ? "update": "insert"
    };
    if (is_literal) {
      clause.value = object_value;
      if (is_text) {
        clause.lang = lang;
      }
    }
    else {
      clause.id = object_value;
      clause.type = [{
        id: ect.id,
        connect: "insert"
      }];
      (ect.included_types || []).forEach(function(t) {
        clause.type.push({
          id: t,
          connect: "insert"
        });
      });
    }
    clauses.push(clause);
  });
  return clauses;
};

/**
 * Get the corresponding validator for a literal type.
 */
function literal_validator(type_id) {
  if (type_id === "/type/datetime") {
    return validators.Timestamp;
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




function mqlread_query(topic_id, prop_structure, prop_value, lang) {
  if (prop_structure.properties) {
    return mqlread_cvt(topic_id, prop_structure, prop_value, lang);
  }
  else {
    return mqlread_object(topic_id, prop_structure, prop_value, lang);
  }
};


function mqlread_cvt(topic_id, prop_structure, prop_value, lang) {
  var clause = {
    id: topic_id
  };
  clause[prop_structure.id] = [{
    id: prop_value
  }];
  prop_structure.properties.forEach(function(subprop_structure) {
    var subclause = mqlread_clause(subprop_structure, null, lang);
    clause[prop_structure.id][0][subprop_structure.id] = subclause;
  });
  return clause;
};


function mqlread_object(topic_id, prop_structure, prop_value, lang) {
  var clause = {
    id: topic_id
  };
  clause[prop_structure.id] = mqlread_clause(prop_structure, prop_value, lang);
  return clause;
};

function mqlread_clause(prop_structure, prop_value, lang) {
  var ect = prop_structure.expected_type;
  var is_literal = h.is_literal_type(ect.id);
  var clause = {optional:true};
  if (is_literal) {
    if (ect.id == "/type/text") {
      clause = i18n.mql.text_clause(lang)[0];
    }
    clause.value = literal_validator(ect.id)(prop_value, {if_empty:null});
/**
    clause.value = literal_validator(ect.id)(prop_value, {if_empty:null});
    if (ect.id === "/type/text") {
      clause.lang = lang;
    }
**/
  }
  else {
    clause.id = prop_value;
    clause.name = i18n.mql.text_clause(lang);
  }
  return [clause];
};
