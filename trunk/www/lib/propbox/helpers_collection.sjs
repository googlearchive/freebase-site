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
  var head = [];
  var body = [];

  /**
   * header
   */
  var subprops = false;

  // primary head row
  var primary_head = [];
  prop_structures.forEach(function(prop_structure) {
    var subprop_structures = prop_structure.properties || [];
    var mediator = prop_structure.expected_type.mediator === true;
    var colspan = 1;
    if (subprop_structures.length) {
      subprops = true;
      if (mediator) {
        colspan = subprop_structures.length;
      }
      else {
        colspan = subprop_structures.length + 1;
      }
    }
    var attrs = {colspan:colspan};
    primary_head.push({structure:prop_structure, attrs:attrs});
  });
  head.push(primary_head);

  // secondary head row for disambiguating prooperties (mediators and deep properties)
  if (subprops) {
    var secondary_head = [];
    prop_structures.forEach(function(prop_structure, i) {
      var subprop_structures = prop_structure.properties || [];
      var mediator = prop_structure.expected_type.mediator === true;
      if (subprop_structures.length) {
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

  /**
   * body
   */
  values.forEach(function(value) {
    var tbody = [];
    var column = 0;
    prop_structures.forEach(function(prop_structure) {
      var subprop_structures = prop_structure.properties || [];
      var mediator = prop_structure.expected_type.mediator === true;
      var prop_values = value[prop_structure.id] && value[prop_structure.id].values || [];

      if (subprop_structures.length) {
        var orig_column = column;
        prop_values.forEach(function(prop_value, row) {
          var tr = ensure_row(tbody, row);
          if (!mediator) {
            tr[column] = {structure:prop_structure, values:[prop_value]};
            column += 1;
          }
          subprop_structures.forEach(function(subprop_structure) {
            var subprop_values = prop_value[subprop_structure.id] && prop_value[subprop_structure.id].values || [];
            tr[column] = {structure:subprop_structure, values:subprop_values};
            column += 1;
          });
          column = orig_column;
        });
        column += subprop_structures.length;
        if (!mediator) {
          column += 1;
        }
      }
      else {
        var tr = ensure_row(tbody, 0);
        tr[column] = {structure:prop_structure, values:prop_values};
        column += 1;
      }
    });
    tbody.value = value;
    body.push(tbody);
  });

  return {
    head: head,
    body: body
  };
};


function ensure_row(table, row) {
  var tr = table[row];
  if (!h.isArray(tr)) {
    tr = table[row] = [];
  }
  return tr;
};
