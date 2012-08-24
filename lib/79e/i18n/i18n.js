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

;(function($) {

  var i18n = window.i18n = {
    /**
     * Edit name/text from freebase_object masthead
     */
    _get_edit_script: function(base_url, callback) {
      if (i18n._get_edit_script.loaded) {
        callback();
      }
      else {
        $.getScript(base_url + "/i18n-edit.mf.js", function() {
          i18n._get_edit_script.loaded = 1;
          callback();
        });
      }
    },

    /**
     * @param context - The context of the trigger (HTMLElement)
     * @param base_url - The base_url to the text_edit_begin.ajax and text_edit_submit.ajax
     * @param id - The topic (subject) id
     * @param prop_id - The text property
     * @param lang - The initial language to edit the text property in
     * @param reload - If TRUE, reload the page on submit/sucess.
     */
    text_edit: function(context, base_url, id, prop_id, lang, reload) {
      i18n._get_edit_script(base_url, function() {
        i18n.edit.text_edit_begin($(context), base_url, id, prop_id, lang, reload);
      });
      return false;
    }
  };

})(jQuery);
