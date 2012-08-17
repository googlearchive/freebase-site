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
var _ = i18n.gettext;
var ph = acre.require("propbox/helpers.sjs");

/**
 * Helper to transform propbox/queries_collection.sjs:collection query to a data structure
 * suitable for the collection template for rendering a collection
 *
 * @see propbox/queries_collection.sjs
 * @see propbox/collection.mjt
 */
function to_table_structure(prop_structures, values, lang) {
  var head = prop_structures_to_head(prop_structures);
  var body = [];
  values.forEach(function(value) {
    body.push(value_to_rows(prop_structures, value));
  });
  return {
    head: head,
    body: body
  };
};

function new_cell(structure, opts) {
  opts = opts || {};

  var css_class = [];
  if (structure.id == "/type/object/name") {
    css_class.push("name");
  }
  if (structure.expected_type && structure.expected_type.id === "/common/image") {
    css_class.push("image");
  }
  if (structure.expected_type && structure.expected_type.id === "/common/document") {
    css_class.push("document");
  }
  return h.extend(true, {}, {
    structure: structure,
    value: null,
    row: 0,
    column: 0,
    attrs: {
      "class": css_class
    }
  }, opts);
};

function prop_structures_to_head(prop_structures) {
  var head = [];
  var subprops = false;
  var primary_head = [];
  var secondary_head = [];
  var column = 0;

  prop_structures.forEach(function(prop_structure) {
    var subprop_structures = prop_structure.properties || [];
    var mediator = prop_structure.expected_type.mediator === true;
    var is_image = prop_structure.expected_type.id === "/common/image";
    var is_doc = prop_structure.expected_type.id === "/common/document";
    var colspan = 1;
    var primary_cell = new_cell(prop_structure, {column: column});

    if (is_image || is_doc) {
      // just show content, no disambiguating props
      column += 1;
    }
    else if (subprop_structures.length) {
      primary_cell.attrs["class"].push("mediator-header");
      subprop_structures = mediator ? subprop_structures : [{id:"/type/object/name", text:_("Name"), expected_type: {id:"/type/text"}}].concat(subprop_structures);
      primary_cell.attrs.colspan = subprop_structures.length;
      subprop_structures.forEach(function(subprop_structure, i) {
        var secondary_cell = new_cell(subprop_structure, {column: column + i});
        secondary_head.push(secondary_cell);
      });
      column = column + subprop_structures.length;
    }
    else {
      column += 1;
    }
    primary_head.push(primary_cell);
  });

  head.push(primary_head);
  if (secondary_head.length) {
    primary_head.forEach(function(cell) {
      var is_image = cell.structure.expected_type.id === "/common/image";
      var is_doc = cell.structure.expected_type.id === "/common/document";
      var subprops = cell.structure.properties && cell.structure.properties.length;
      if (is_image || is_doc || !subprops) {
        cell.attrs.rowspan = 2;
      }
    });
    head.push(secondary_head);
  }
  return head;
};

function value_to_rows(prop_structures, value, start_column) {
  var rows = [];
  var column = start_column || 0;
  var last_vals = [];

  prop_structures.forEach(function(prop_structure) {
    var prop_values = value[prop_structure.id] && value[prop_structure.id].values || [];
    var subprop_structures = prop_structure.properties || [];
    var expected_type = prop_structure.expected_type || {};
    var is_image = expected_type.id === "/common/image";
    var is_doc = expected_type.id === "/common/document";
    var mediator = expected_type.mediator === true;
    var is_literal = h.is_literal_type(expected_type.id);
    var row = ensure_row(rows, 0);
    var cell = new_cell(prop_structure, {column: column});

    if (is_image) {
      cell.images = prop_values;
      last_vals[column] = cell;
      row.push(cell);
      column += 1;
    }
    else if (is_doc) {
      cell.docs = prop_values;
      last_vals[column] = cell;
      row.push(cell);
      column += 1;
    }
    else if (subprop_structures.length) {
      var orig_column = column,
          current_row = 0,
          structures = mediator ? subprop_structures : [{id:"/type/object/name", expected_type: {id:"/type/text"}}].concat(subprop_structures);

      if (!prop_values.length) {
        structures.forEach(function(structure) {
          var cell = new_cell(structure, {column: column});
          last_vals[column] = cell;
          row.push(cell);
          column += 1;
        });
      }
      else {
        prop_values.forEach(function(prop_value) {
          column = orig_column;
          if (!mediator) {
            var value = {
              text: prop_value.text,
              lang: prop_value.lang,
              id: prop_value.id
            };
            prop_value["/type/object/name"] = {values:[value]};
          }
          var sub_rows = value_to_rows(structures, prop_value.property, column);
          sub_rows.last_vals.forEach(function(last_val) {
            last_val.row = last_val.row + current_row;
            last_vals[column] = last_val;
            column += 1;
          });
          sub_rows.forEach(function(sub_row) {
            ensure_row(rows, current_row);
            rows[current_row] = rows[current_row].concat(sub_row);
            current_row += 1;
          });
        });
      }
    }
    else {
      if (!prop_values.length) {
        last_vals[column] = cell;
        row.push(cell);
      }
      else {
        prop_values.forEach(function(prop_value, prop_index) {
          var row = ensure_row(rows, prop_index);
          var cell = new_cell(prop_structure, {
            value:prop_value,
            row:prop_index,
            column: column
          });
          if (prop_structure.id === "/type/object/name") {
            cell.value.id = value.id;
          }
          last_vals[column] = cell;
          row.push(cell);
        });
      }
      column += 1;
    }
  });

  // pad rowspan of last value in each column
  last_vals.forEach(function(last_val) {
    last_val.attrs.rowspan = rows.length - last_val.row;
  });

  rows.last_vals = last_vals;
  rows.value = value;
  return rows;
};

function ensure_row(table, row) {
  var tr = table[row];
  if (!h.isArray(tr)) {
    tr = table[row] = [];
  }
  return tr;
};
