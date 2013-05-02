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

(function($, fb, propbox) {

  var i18n_tab = fb.i18n_tab = {

    init: function() {
      // Initialize menus
      propbox.init_menus();
    },

    add_name: function(context, lang) {
      var row = $(context).parents(".data-row:first");
      fb.get_script(fb.h.static_url("i18n-edit.mf.js"), function() {
        i18n_tab.edit.add_name_begin(row, lang);
      });
      return false;
    },

    edit_name: function(context, lang) {
      context = $(context);
      var value = context.attr('data-value');
      var row = context.parents(".submenu").data("headmenu").parents(".data-row:first");
      fb.get_script(fb.h.static_url("i18n-edit.mf.js"), function() {
        i18n_tab.edit.edit_name_begin(row, value, lang);
      });
      return false;
    },

    delete_name: function(context, lang) {
      context = $(context);
      var value = context.attr('data-value');
      var row = context.parents(".submenu").data("headmenu").parents(".data-row:first");
      fb.get_script(fb.h.static_url("i18n-edit.mf.js"), function() {
        i18n_tab.edit.delete_name_begin(row, value, lang);
      });
      return false;
    }

  };

  $(i18n_tab.init);

})(jQuery, window.freebase, window.propbox);
