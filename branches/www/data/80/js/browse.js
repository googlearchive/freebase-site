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

  var browse = fb.browse = {

    init: function() {
      browse.init_activity_charts($(".domain-activity"));
      browse.init_suggest();
    },

    init_suggest: function() {
          // Setup schema search tabset
          var $schema_explorer_search_tabset = $("#schema-search > .section-tabset").tabs("#schema-search > .search-box", {
            initialIndex: 0,
            api: true
          });

          var suggest_options = {

            get_options: function(type) {
              var filters = ["type:" + type];
              if ($("#domain-search-toggle-commons").is(":checked")) {
                filters.push("with:commons");
              }
              return $.extend(fb.suggest_options.all.apply(null, filters), {scoring:"schema"});
            },

            domain: function() {
              return suggest_options.get_options("/type/domain");
            },

            type: function() {
              return suggest_options.get_options("/type/type");
            },

            property: function() {
              return suggest_options.get_options("/type/property");
            }
          };


          /*
              DOMAIN SUGGEST
          */
          var $domain_input = $("#domain-search-input");
          var $domain_form = $domain_input.closest("form");

          $domain_form.submit(function(){
            return false;
          });

          $domain_input.suggest(suggest_options.domain())
            .bind("fb-select", function(e, data){
              window.location.href = fb.h.fb_url(data.id, [['schema']]);
            })
            .focus(function() {
              this.select();
            });

          /*
              TYPE SUGGEST
          */
          var $type_input = $("#type-search-input");
          var $type_form = $type_input.closest("form");

          $type_form.submit(function(){
            return false;
          });

          $type_input.suggest(suggest_options.type())
            .bind("fb-select", function(e, data){
              window.location.href = fb.h.fb_url(data.id, [['schema']]);
            })
            .focus(function() {
              this.select();
            });

          /*
              PROPERTY SUGGEST
          */
          var $property_input = $("#property-search-input");
          var $property_form = $property_input.closest("form");

          $property_form.submit(function(){
            return false;
          });

          $property_input.suggest(suggest_options.property())
            .bind("fb-select", function(e, data){
              window.location.href = fb.h.fb_url(data.id, [['schema']]);
            })
            .focus(function() {
              this.select();
            });

          /*
              USER SUGGEST
          */
      /*
          var $user_input = $("#user-search-input");
          var $user_form = $user_input.closest("form");
      */

          /*
              Schema Search Toggles
              On click for radio buttons, we have to update mql_filter params and reinitialize suggest

          */
          $(".search-toggle").click(function(e){
            var $el = $(this);
            var $parent = $(this).parent().siblings("form");

            /*
             We grab the radio buttons closest form
             and compare it's ID to decide which mql_filter
             we need to update.
             */

            // Split ID to compare string
            var el_id = $el.attr("id").split("-");

            // Domain
            if ($parent.attr("id") === $domain_form.attr("id")) {
              $domain_input.suggest(suggest_options.domain());
            }

            // Type
            else if ($parent.attr("id") === $type_form.attr("id")) {
              $type_input.suggest(suggest_options.type());
            }

            // Property
            else if ($parent.attr("id") === $property_form.attr("id")) {
              $property_input.suggest(suggest_options.property());
            }

            // focus related input, preserving user input
            var $text_input = $parent.find(".text-input");
            var search_term = $text_input.val();
            $text_input.val(search_term).focus().trigger(jQuery.Event("keyup"));
          });
    },

    init_activity_charts: function(scope) {
      $(".activity-chart-assertions", scope).each(function() {
        var $chart = $(this);
        var weeks = JSON.parse($chart.attr("data-activity"));
        var x = [], edits = [];
        for (var i=1; i < weeks.length; i++) {
          var edit = parseInt(weeks[i].e, 10);
          edits.push([i, edit]);
        }

        var options = {
          grid: {
            show: true,
            color: "#fff",
            borderWidth: 0,
            hoverable: true,
            autoHighlight: true,
            mouseActiveRadius: 3
          },
          legend: {show: false},
          xaxis: {
            tickFormatter: function() {return "";},
            ticks: []
          },
          yaxis: {
            tickFormatter: function() {return "";},
            ticks: []
          }
        };
        var series = {
          data: edits,
          lines: {
            show: true
          },
          points: {
            show: true,
            radius: 2,
            fill: true,
            fillColor: "#f71"
          },
          shadowSize: 0,
          color: "#f71"
        };
        $.plot($chart, [series], options);
      });
    }
  }

  setTimeout(function() {browse.init();}, 1);

})(jQuery, window.freebase);
