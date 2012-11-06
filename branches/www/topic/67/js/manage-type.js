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

(function($, fb, formlib, propbox) {
  var mt = fb.topic.manage_type = {

    add_type_begin: function(trigger, type_id, incompatible_types) {
      incompatible_types = incompatible_types || {};
      var included_types = [];
      if (incompatible_types.included_types) {
        $.each(incompatible_types.included_types, function(i, t) {
          if (!incompatible_types[t]) {
            included_types.push(t);
          }
        });
      }

      $.ajax($.extend(formlib.default_submit_ajax_options(), {
        url: fb.h.ajax_url("add_type_submit.ajax"),
        data: {id:fb.c.id, type:type_id, included_types:included_types, lang:fb.h.lang_code(fb.lang)},
        onsuccess: function(data) {
          var result = $(data.result.html).hide();
          $(".manage-types").after(result);

          result.fadeIn(function() {
              propbox.init_menus(result, true);
          });

          // insert new added type + included types to the manage type list
          var list = data.result.list;
          if (list) {
            list = $(list);
            var new_items = $("li", list).hide();
            var new_list = $(".topic-type-list ul").prepend(new_items);
            new_items.fadeIn();
          }

          trigger.focus().select();
        },
        traditional: true
      }));
    },

    remove_type_begin: function(trigger, type_id) {
      $.ajax($.extend(formlib.default_submit_ajax_options(), {
        url: fb.h.ajax_url("remove_type_submit.ajax"),
        data: {id:fb.c.id, type:type_id, lang:fb.h.lang_code(fb.lang)},
        onsuccess: function(data) {
          var type_section = $(".type-section[data-id=" + type_id.replace(/\//g, "\\\/") + "]").fadeOut();
          var trigger_row = trigger.parent("li");
          var result = $(data.result.html);
          trigger_row.hide().before(result);
          trigger.focus().select();
        }
      }));
    },

    undo_remove_type: function(trigger, type_id) {
      $.ajax($.extend(formlib.default_submit_ajax_options(), {
        url: fb.h.ajax_url("undo_remove_type.ajax"),
        data: {id:fb.c.id, type:type_id},
        onsuccess: function(data) {
          // just show the .type-section we hid in remove_type_submit
          var type_section = $(".type-section[data-id=" + type_id.replace(/\//g, "\\\/") + "]").fadeIn();
          var undo_row = $(trigger).parents("li.remove-type-result");
          undo_row.hide().next("li:hidden").show().end().remove();
        }
      }));
      return false;
    }
  };

})(jQuery, window.freebase, window.formlib, window.propbox);
