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


(function($, fb) {

  var filters = fb.filters = {
    init_domain_type_property_filter: function(context) {
      // *** Initialize domain/type/property suggest input
      $(":text[name=domain], :text[name=type], :text[name=property]", context)
        .suggest($.extend({
            scoring: "schema",
            format: null,
            // The new search is no longer returning (notable) types for schema objects.
            // However, it still support mql_output
            mql_output: JSON.stringify([{
                id: null,
                name: null,
                type: {
                    id: null,
                    "id|=": ["/type/domain", "/type/type", "/type/property"],
                    limit: 1
                }
            }])
        }, fb.suggest_options.any("type:/type/domain", 
                                  "type:/type/type",
                                  "type:/type/property")
        ))
        .bind("fb-select", function(e, data) {
          var $this = $(this);
          $this.val(data.id);
          var type = data.type.id;
          if (type === "/type/domain") {
            $this.attr("name", "domain");
          }
          else if (type === "/type/type") {
            $this.attr("name", "type");
          }
          else if (type === "/type/property") {
            $this.attr("name", "property");
          }
          this.form.submit();
        })
        .parents(".filter-form").submit(function() {
            // disable default submit (ENTER) without picking
            // something from the suggest list
            return false;
        });
    }
  };

  $(function() {
    $(".filter-form :input").keypress(function(e) {
      if (e.keyCode === 13) {
        this.form.submit();
      }
      return true;
    });
    $(".filter-help-trigger").tooltip({
          events: {def: "click,mouseout"},
          position: "top center",
          effect: "fade",
          delay: 300,
          offset: [-8, 0]
      });
    // *** Initialize triggers for showing/hiding hidden inputs
    $(".filter-form-trigger").click(function(){
      var $form = $(this).siblings(".filter-form");
      if($form.is(":hidden")) {
        $form.slideDown(function() {
          $(":text:first", $form).focus();
        });
      }
      else {
        $form.slideUp();
      }
    });
  });

})(jQuery, window.freebase);
