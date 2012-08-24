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

acre.require('/test/lib').enable(this);

var i18n = acre.require("i18n/i18n.sjs");
acre.require("globalize/cultures/globalize.culture.he.js");

test("cultures", function() {
  // do we have all the cultures for all the i18n.LANG_TIERS

  var cultures = [];
  var lib = acre.get_metadata();
  i18n.LANG_TIERS.forEach(function(code) {
      if (code === "en") {
          // en is the default
          return;
      }
      var g_code = i18n.get_globalize_culture_lang_code(code);
      var fname = "globalize/cultures/globalize.culture." + g_code + ".js";
      if (lib.files[fname]) {
          ok(true, [code, fname].join("=>"));
          cultures.push(fname);
          return;
      }
      else {
          // look for other codes
          var lang = i18n.LANGS_BY_CODE[code];
          for (var i=0,l=lang.key.length; i<l; i++) {
              var key = lang.key[i];
              if (key != code) {
                  g_code = i18n.get_globalize_culture_lang_code(key);
                  fname = "globalize/cultures/globalize.culture." + g_code + ".js";
                  if (lib.files[fname]) {
                      ok(true, [code, fname].join("==>"));
                      cultures.push(fname);
                      return;
                  }
              }
          }
      }
      ok(false, "Could not file culture for: " + code);
  });
});


acre.test.report();
