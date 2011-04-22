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

;(function($, i18n) {

  i18n.edit = {

    text_edit_begin: function(base_url, id, prop_id, lang) {
      var submit_data = {
        s: id,
        p: prop_id,
        lang: lang
      };
      $.ajax({
        url: base_url + "/text_edit_begin.ajax",
        data: submit_data,
        dataType: "json",
        success: function(data, status, xhr) {
          var html = $(data.result.html);
          i18n.edit.text_edit_init(html);
        },
        error: function(xhr) {
          // TODO: handle error
          console.error("text_edit_begin", xhr);
        }
      });

    },

    text_edit_init: function(content) {
      $(document.body).append(content.hide());
      //$(".table-sortable", content).tablesorter();
      content.overlay({
        close: ".modal-buttons .button-cancel",
        closeOnClick: false,
        load: true,
        mask: {
          color: '#000',
          loadSpeed: 200,
          opacity: 0.5
        },
        onLoad: function() {

        }
      });
    }

  };

})(jQuery, window.i18n);
