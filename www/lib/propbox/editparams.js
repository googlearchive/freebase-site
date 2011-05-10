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

;(function($) {

  var ep = window.editparams = {

    Empty: function(structure, data, msg) {
      this.structure = structure;
      this.data = data;
      this.msg = msg;
      this.toString = function() {
        return "Empty: " + this.msg;
      };
    },

    Invalid: function(structure, data, msg) {
      this.structure = structure;
      this.data = data;
      this.msg = msg;
      this.toString = function() {
        return "Invalid: " + this.msg;
      };
    },

    error: function() {
      var msg = Array.prototype.slice.call(arguments);
      msg.splice(0, 0, "editparams:");
      console.error.apply(console, msg);
      throw new Error(msg.join(" "));
    },

    assert: function(truth) {
      if (!truth) {
        var msg = Array.prototype.slice.call(arguments, 1);
        ep.error.apply(null, msg);
      }
    },

    /**
     * Responsible for figuring out the "diff" between the original values of a property and
     * the new values from the data-inputs contained within the context element.
     *
     * Only gathers inputs that are of ".data-input" within the context element.
     * @see jquery.data_inputs.js
     *
     * Examples:
     * 1. Insert
     *    old_values = [], new_values = [a] => "insert a"
     *
     * 2. Delete
     *    old_values = [a], new_values = [] => "delete a"
     *
     * 3. Update
     *    old_values = [a], new_values = [b] => "delete a", "insert b" (if unique property, "update b")
     *
     * @param structure - the property structure returned by topic api
     *
     * {
     *    id: ...,
     *    expected_type: ...,
     *    unique: ...,
     *    properties: [...],
     *    values: [...],
     * }
     *
     * @param context - The context to gather new/updated values (jQuery object)
     * @return the MQL write clause that can be used directly:
     *
     * {
     *    id: <subject_id>,
     *    "<structure.id>": editparams.parse(structure, context)
     * }
     *
     */
    parse: function(structure, context) {
      //
      // TODO: assert structure is valid (and it's values)
      //
      var old_values = (structure.values || []).slice();
      var props = structure.properties || [];
      var mediator = structure.expected_type.mediator || props.length;

      if (mediator) {
        ep.assert(props.length, "mediator must have 1 or more properties");
        ep.assert(!old_values.length || old_values.length === 1,
                  "Can't update more than one value (row) for a mediator");
      }

      function accept_or_reject(data_input, prop, data, existing_values, prop_values) {
//console.log("accept_or_reject", data);

        // if accept,
        //   append data to prop_values
        // if reject,
        //   remove from existing_values as specified by data_input attrs (data-id|value, data-lang)
        //   and DON'T append to prop_values
        // This is a safeguard so that we don't update existing values,
        // whose replacement values are invalid or empty
        try {
          ep.validate(prop, data);
          // accept
          prop_values.push(data);
        }
        catch (ex) {
          if (ex instanceof ep.Empty) {
            // accept
            prop_values.push(data);
          }
          else {
            throw ex;

/**
            // reject
            var odata = data_input.metadata();
            var keys_to_compare;
            var ect = prop.expected_type.id;
            if (ep.LITERAL_TYPE_IDS[ect]) {
              keys_to_compare = ["value"];
              if (ect === "/type/text") {
                keys_to_compare.push("lang");
              }
            }
            else {
              keys_to_compare = ["id"];
            }
            var index = ep.inArray.apply(null, [odata, existing_values].concat(keys_to_compare));
            if (index !== -1) {
              existing_values.splice(index, 1);
            }
**/
          }
        }
      };

      var new_values = [];
      $(".data-input", context).each(function() {
        var $this = $(this);
        var inst = $this.data("$.data_input");
        ep.assert(inst, "$.data-input not initialized");
        // force validation
        inst.validate(true);
        ep.assert(!$this.is(".error"), "$.data-input is invalid");
        var data = $this.data("data");
        ep.assert(data, "$.data-input has no data");
        if (mediator) {
          if (!new_values.length) {
            // you can only upate one row for a mediator
            new_values.push({});
            $.each(props, function(i,prop) {
              new_values[0][prop.id] = $.extend({}, prop, {values:[]});
            });
          }
          // data.name is expected to be the sub-property id
          var prop = new_values[0][data.name];
          if (prop) {
            var existing_values = [];
            if (old_values.length) {
              var p = old_values[0][prop.id];
              existing_values = p.values || [];
            }
            accept_or_reject($this, prop, data, existing_values, prop.values);
          }
          else {
            console.warn("editparams", "unknown mediator property data", data);
          }
        }
        else {
          accept_or_reject($this, structure, data, old_values, new_values);
        }
      });
      if (mediator) {
        return ep.parse_mediator(structure, old_values, new_values);
      }
      else {
        return ep.parse_simple(structure, old_values, new_values);
      }
    },

    parse_mediator: function(structure, old_values, new_values) {
//      console.log("parse_mediator", structure, old_values, new_values);
      ep.assert(new_values.length === 1,
                "Can't update more than one value (row) for a mediator");
      var new_value = new_values[0];
      var old_value;
      if (old_values.length) {
        old_value = old_values[0];
      }
      var clause = {};
      if (old_value) {
        clause.id = old_value.id;
      }
      else {
        clause.id = null;
        clause.create = "unconditional";
        clause.connect = structure.unique ? "replace" : "insert";
      }
      var has_diff = false;
      var sub_props = structure.properties;
      for (var i=0,l=sub_props.length; i<l; i++) {
        var sub_prop = sub_props[i];
        var sub_old_values = old_value && old_value[sub_prop.id] && old_value[sub_prop.id].values || [];
        var sub_new_values = new_value[sub_prop.id] && new_value[sub_prop.id].values || [];
        var d = ep.parse_simple(sub_prop, sub_old_values, sub_new_values);
        if (d.length) {
          clause[sub_prop.id] = d;
          has_diff = true;
        }
      };
      if (has_diff) {
        return [clause];
      }
      else {
        return [];
      }
    },

    parse_simple: function(structure, old_values, new_values) {
//console.log("parse_simple", old_values, new_values);
      return ep.diff(structure, old_values, new_values);
    },

    /**
     * This is the guts of the editparams parser.
     * It takes the old values and "diffs" against the new values,
     * determining what's being deleted and what is being inserted (replaced)
     * in the context of the property (structure - i.e., unique, /type/text, etc.).
     */
    diff: function(structure, old_values, new_values) {
//console.log("diff", old_values, new_values);
      var ect = structure.expected_type.id;
      var is_unique = structure.unique;
      var is_text = ect === "/type/text";
      if (is_unique) {
        if (is_text) {
          // TODO: assert one value per lang in old_values and new_values
        }
        else {
          // unique non-/type/text values cannot have > 1 value
          // /type/text is special because of "lang"
          if (old_values.length && old_values.length !== 1) {
            throw new ep.Invalid("Uniqueness error on old values");
          }
          else if (new_values.length && new_values.length !== 1) {
            throw new ep.Invalid("Uniqueness error on new values");
          }
        }
      }
      var is_literal = ep.LITERAL_TYPE_IDS[ect];
      var keys_to_compare = [];
      if (is_literal) {
        keys_to_compare.push("value");
        if (is_text) {
          keys_to_compare.push("lang");
        }
      }
      else {
        keys_to_compare.push("id");
      }
      var deletes = [];
      var inserts = [];

      var i,l;
      for (i=0,l=old_values.length; i<l; i++) {
        var old_value = old_values[i];
        ep.validate(structure, old_value);
        if (ep.inArray.apply(null, [old_value, new_values].concat(keys_to_compare)) === -1) {
          // if not old_value in new_values (delete)
          deletes.push(ep.clause(old_value, "delete"));
        }
      }

      for (i=0,l=new_values.length; i<l; i++) {
        var new_value = new_values[i];
        try {
          ep.validate(structure, new_value);
        }
        catch (ex) {
          continue;
        }
        // if not new_value in old_values (insert)
        if (ep.inArray.apply(null, [new_value, old_values].concat(keys_to_compare)) === -1) {
          if (is_unique) {
            if (is_text) {
              // if deleting a text value in the same lang, remove it from the deletes since we're replacing it
              var index = ep.inArray(new_value, deletes, "lang");
              if (index !== -1) {
                deletes.splice(index, 1);
              }
            }
            else {
              return [ep.clause(new_value, "replace")];
            }
          }
          inserts.push(ep.clause(new_value, is_unique ? "replace" : "insert"));
        }
      };
      return deletes.concat(inserts);
    },

    validate: function(structure, data) {
      var ect = structure.expected_type.id;
      if (ep.LITERAL_TYPE_IDS[ect]) {
        if (ep.isEmpty(data.value)) {
          // empty means delete
          throw new ep.Empty(structure, data);
        }
        else {
            if (ect === "/type/text" && ep.isEmpty(data.lang)) {
              throw new ep.Invalid(structure, data, "Expected data.lang for /type/text");
            }
          if (ect === "/type/int" || ect === "/type/float") {
            if ($.type(data.value) !== "number") {
              throw new ep.Invalid(structure, data, "Expected number data.value for " + ect);
            }
          }
          else if (ect === "/type/boolean") {
            if ($.type(data.value) !== "boolean") {
              throw new ep.Invalid(structure, data, "Expected boolean data.value for /type/boolean");
            }
          }
          else if ($.type(data.value) !== "string") {
            throw new ep.Invalid(structure, data, "Expected string data.value for " + ect);
          }
        }
      }
      else if (ep.isEmpty(data.id)) {
        // empty value means delete
        throw new ep.Empty(structure, data);
      }

      return data;
    },

    clause: function(value, connect) {
      var clause = {connect:connect};
      if (value.id) {
        clause.id = value.id;
      }
      else {
        clause.value = value.value;
        if (value.lang) {
          clause.lang = value.lang;
        }
      }
      return clause;
    },

    inArray: function(value, array /**, key1, key2, ..., keyN **/) {
      var keys = Array.prototype.slice.call(arguments, 2);
      if (!keys.length) {
        return $.inArray(value, array);
      }
      for (var i=0,l=array.length; i<l; i++) {
        var item = array[i];
        var found = true;
        for (var j=0,k=keys.length; j<k; j++) {
          var key = keys[j];
          if (item[key] != value[key]) {
            found = false;
            break;
          }
        }
        if (found) {
          return i;
        }
      }
      return -1;
    },

    isEmpty: function(val) {
      return val == null || val === "";
    },

    LITERAL_TYPE_IDS: {
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
    }

  };



})(jQuery);
