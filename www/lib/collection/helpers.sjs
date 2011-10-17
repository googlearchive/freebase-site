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

function prop_structures_to_head(prop_structures) {
  var head = [],
      subprops = false,
      primary_head = [];

  prop_structures.forEach(function(prop_structure) {
    var subprop_structures = prop_structure.properties || [],
        mediator = prop_structure.expected_type.mediator === true,
        is_image = prop_structure.expected_type.id === "/common/image",
        colspan = 1,
        css_class = "";

    if (is_image) {
      // just show <img>, no disambiguating props
      css_class = "image";
    }
    else if (subprop_structures.length) {
      subprops = true;
      if (mediator) {
        colspan = subprop_structures.length;
        css_class = "mediator-header";
      }
      else {
        colspan = subprop_structures.length + 1;
        css_class = "mediator-sub-prop";
      }
    }
    var attrs = {colspan:colspan, "class": css_class};
    primary_head.push({structure:prop_structure, attrs:attrs});
  });
  head.push(primary_head);

  // secondary head row for disambiguating prooperties (mediators and deep properties)
  if (subprops) {
    var secondary_head = [];
    prop_structures.forEach(function(prop_structure, i) {
      var subprop_structures = prop_structure.properties || [],
      mediator = prop_structure.expected_type.mediator === true,
      is_image = prop_structure.expected_type.id === "/common/image";

      if (!is_image && subprop_structures.length) {
        if (!mediator) {
          secondary_head.push({structure:{text:_("Name")}});
        }
        subprop_structures.forEach(function(subprop_structure) {
          secondary_head.push({structure:subprop_structure});
        });
      }
      else {
        primary_head[i].attrs.rowspan = 2;
      }
    });
    head.push(secondary_head);
  }
  return head;
};

function value_to_rows(prop_structures, value) {
  var rows = [],
      column = 0,
      last_vals = [];

  prop_structures.forEach(function(prop_structure) {
    var prop_values = value[prop_structure.id] && value[prop_structure.id].values || [],
        subprop_structures = prop_structure.properties || [],
        expected_type = prop_structure.expected_type || {},
        is_image = expected_type.id === "/common/image",
        mediator = expected_type.mediator === true,
        row = ensure_row(rows, 0),
        cell = {row:0};

    if (is_image) {
      cell = {structure:prop_structure, images:prop_values, row:0};
      last_vals[column] = cell;
      row.push(cell);
      column += 1;
    }
    else if (subprop_structures.length) {
      var orig_column = column,
          current_row = 0,
          structures = mediator ? subprop_structures : [{id:"/type/object/name"}].concat(subprop_structures);

      if (!prop_values.length) {
        structures.forEach(function() {
          cell = {row:0};
          last_vals[column] = cell;
          row.push(cell);
          column += 1;
        });
      }
      else {
        prop_values.forEach(function(prop_value) {
          column = orig_column;
          if (!mediator) {
            prop_value["/type/object/name"] = {values:[prop_value]};
          }
          var sub_rows = value_to_rows(structures, prop_value);
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
          cell = {structure:prop_structure, value:prop_value, row:prop_index};
          last_vals[column] = cell;
          row.push(cell);
        });
      }
      column += 1;
    }
  });

  // pad rowspan of last value in each column
  last_vals.forEach(function(last_val) {
    last_val.rowspan = rows.length - last_val.row;
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
