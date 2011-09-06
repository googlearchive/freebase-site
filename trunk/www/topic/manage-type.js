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

(function($, fb) {
  var mt = fb.topic.manage_type = {

    remove_type_begin: function(trigger, type_id) {
      $.ajax($.extend(fb.form.default_submit_ajax_options(), {
        url: fb.h.ajax_url("remove_type_submit.ajax"),
        data: {id:fb.c.id, type:type_id, lang:fb.lang},
        onsuccess: function(data) {
          var type_section = ".type-section[data-id=" + type_id.replace(/\//g, "\\/") + "]";
          type_section = $(type_section);
          var result = $(data.result.html);
          type_section.before(result);
          type_section.hide();
          result.append(type_section); // keep around for undo
          result[0].scrollIntoView();
          trigger.parent("li").remove();
        }
      }));
    },

    undo_remove_type: function(trigger, type_id) {
      $.ajax($.extend(fb.form.default_submit_ajax_options(), {
        url: fb.h.ajax_url("undo_remove_type.ajax"),
        data: {id:fb.c.id, type:type_id},
        onsuccess: function(data) {
          // just show the .type-section we hid in remove_type_submit
          var p = $(trigger).parents(".remove-type-result");
          var type_section = $(".type-section", p);
          p.before(type_section);
          type_section.show();
          p.remove();
        }
      }));
      return false;
    }
  };

})(jQuery, window.freebase);
