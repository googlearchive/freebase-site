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

  var filters = fb.filters = {
    init_domain_type_property_filter: function(context) {
      // *** Initialize domain/type/property suggest input
      $(":text[name=domain], :text[name=type], :text[name=property]", context).suggest({
        service_url: fb.h.legacy_fb_url(),
        type: ["/type/domain", "/type/type", "/type/property"],
        type_strict: "any"
      })
      .bind("fb-select", function(e, data) {
        var $this = $(this);
        $this.val(data.id);
        var type = data["n:type"].id;
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
      });
    },

    init_limit_slider_filter: function(context, default_value, min, max, step) {
      // slider for controlling property limit
      var slider = $(".limit-slider", context);
      var current = $(".current-limit", context);
      var input = $("input[name=limit]", context);
      var val = parseInt(input.val() || default_value);

      slider.slider({
        value: val,
        min: min || 1,
        max: max || 100,
        step: step || 10,
        slide: function(e, ui) {
          current.css({'color': '#f71'});
          current.text(ui.value);
        },
        stop: function(e, ui) {
          current.css({'color': '#333'});
          input.val(ui.value);
          if (ui.value != val) {
            input[0].form.submit();
          }
        }
      });
    }
  };

  $(function() {

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
